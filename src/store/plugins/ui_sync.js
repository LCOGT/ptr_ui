import { NotificationProgrammatic as Notification, DialogProgrammatic as Dialog } from 'buefy'

// Uncomment this if you need to run locally without an internet connection
// const io = () => {
//   return {
//     on: () => {},
//     emit: () => {}
//   }
// }

const UiSyncPlugin = (store) => {
  const websocketServerUrl = 'https://uisync.photonranch.org'
  const socket = io(websocketServerUrl) // eslint-disable-line

  socket.on('confirm_connect', payload => {
    store.commit('uiSync/ui_sync_site_leaders', payload.leaders)
  })

  socket.on('my_response', function (msg) {
    console.log('ui_sync_websocket:', msg)
  })

  socket.on('all_leaders', payload => {
    console.log('all leaders: ', payload.leaders)
    store.commit('uiSync/ui_sync_site_leaders', payload.leaders)
  })

  socket.on('confirm_leader_start', payload => {
    Notification.open({
      message: `Your session as leader of site ${payload.site} has started`,
      position: 'is-top',
      type: 'is-primary',
      size: 'is-large',
      duration: 5000 // 10 seconds
    })
  })
  socket.on('confirm_leader_end', payload => {
    Notification.open({
      message: `Your session as leader of site ${payload.site} has ended`,
      position: 'is-top',
      type: 'is-primary',
      size: 'is-large',
      duration: 5000 // 10 seconds
    })
  })
  socket.on('confirm_follower_start', payload => {
    Notification.open({
      message: `Your session as follower of site ${payload.site} has started`,
      position: 'is-top',
      type: 'is-primary',
      size: 'is-large',
      duration: 5000 // 10 seconds
    })
  })
  socket.on('confirm_follower_end', payload => {
    Notification.open({
      message: `Your session as follower of site ${payload.site} has ended`,
      position: 'is-top',
      type: 'is-primary',
      size: 'is-large',
      duration: 5000 // 10 seconds
    })
  })

  socket.on('new_state', payload => {
    // Followers should update any new incoming state
    if (store.state.uiSync.ui_sync_role == 'follower') {
      const key = payload.key
      const val = payload.new_val
      console.log('new state: ', key, val)
      store.commit(key, val)
    }
  })

  // Handle a leader ending their leading role for any current followers
  socket.on('no_more_leader', payload => {
    Notification.open({
      message: `Notice: ${payload.leader_name} has stopped syncing their UI state.`,
      position: 'is-bottom',
      type: 'is-warning',
      size: 'is-large',
      duration: 10000 // 10 seconds
    })
  })

  socket.on('full_state_snapshot', payload => {
    console.log('restoring full state', payload)
    const leader = payload.leader.name
    const full_state = payload.state_snapshot

    // Save leader info
    store.commit('uiSync/ui_sync_current_leader', payload.leader)

    // Update all state from leader state snapshot
    Object.keys(full_state).forEach(key => {
      store.commit(key, full_state[key])
    })
    // Notify user of the leader
    const htmlMessage = `<p> Session leader: ${leader}</p>
            <p> Changes that the leader makes to their user interface will be changed in your page too. 
            For example, if they change the selected exposure time, that number will show up in 
            your camera tab. Or if they switch to view the enclosure tab, your view will switch too.</p> 
            <br>
            <p>Changes you make as follower will not be visible to anyone. Be careful if you change 
            something, as it may be unclear later whether the leader is using that value or not</p>
            <br>
            <p> If you ever need to re-sync your state with the leader, 
            simply stop following and then start following again.</p>`
    Dialog.confirm({
      title: 'UI Sync Turned On',
      message: htmlMessage,
      position: 'is-top',
      cancelText: 'Stop Following',
      confirmText: 'Got it!',
      type: 'is-info',
      canCancel: ['button'],
      indefinite: true,
      onCancel: () => { store.commit('uiSync/ui_sync_role', 'none') }
    })
  })

  // For command_param mutations, also emit to websocket
  store.subscribe((mutation, state) => {
    // Broadcast state if user is leader
    if (state.uiSync.ui_sync_role == 'leader' && mutation.type != 'uiSync/ui_sync_role') {
      if (mutation.type.startsWith('command_params/') ||
        mutation.type.startsWith('user_interface/') ||
        mutation.type.startsWith('site_config/selected_')) {
        const payload = {
          site: store.state.site_config.selected_site,
          mutation_name: mutation.type,
          new_val: mutation.payload
        }
        console.log('payload', payload)
        socket.emit('ui_change', payload)
      }
    }

    // Handle user changing roles between [leader, follower, none]
    else if (mutation.type == 'uiSync/ui_sync_role') {
      // Leader to follower
      if (state.uiSync.prev_ui_sync_role == 'leader' && mutation.payload == 'follower') {
        endLeaderSession(store, socket)
        startFollowerSession(store, socket)
      }
      // Leader to none
      else if (state.uiSync.prev_ui_sync_role == 'leader' && mutation.payload == 'none') {
        endLeaderSession(store, socket)
      }
      // Follower to leader
      else if (state.uiSync.prev_ui_sync_role == 'follower' && mutation.payload == 'leader') {
        endFollowerSession(store, socket)
        startLeaderSession(store, socket)
      }
      // Follower to none
      else if (state.uiSync.prev_ui_sync_role == 'follower' && mutation.payload == 'none') {
        endFollowerSession(store, socket)
      }
      // None to leader
      else if (state.uiSync.prev_ui_sync_role == 'none' && mutation.payload == 'leader') {
        startLeaderSession(store, socket)
      }
      // None to follower
      else if (state.uiSync.prev_ui_sync_role == 'none' && mutation.payload == 'follower') {
        startFollowerSession(store, socket)
      }
    }
  }

  )
}

function startLeaderSession (store, socket) {
  // get a full snapshot of the state we want to sync
  const fullStateSnapshot = createFullStateSnapshot(store)

  const payload = JSON.stringify({
    site: store.state.site_config.selected_site,
    full_state_snapshot: fullStateSnapshot,
    leader: store.getters['user_data/authenticatedUser']
  })
  socket.emit('new_leader', payload)
}

function endLeaderSession (store, socket) {
  socket.emit('remove_leader', { site: store.state.site_config.selected_site })
}

function startFollowerSession (store, socket) {
  const payload = { site: store.state.site_config.selected_site }
  socket.emit('join_room', payload)
}

function endFollowerSession (store, socket) {
  const payload = { site: store.state.site_config.selected_site }
  socket.emit('leave_room', payload)
}

/**
 *
 * This method operates on a vuex store, transforming a subset of state that we want into an
 * object where each key is the name of the mutation used to set the val.
 *
 * This is so that when the server sends back the full state snapshot, it's easy for clients
 * to simply apply all the mutations to get an identical state as the leader
 *
 * In order for this to work, the state we want to sync must live in a vuex module where the
 * name of the state's mutation follows the format '<vuexModuleName>/<stateItemName>'
 *
 * Example object returned by this method:
 * {
 *  "command_params/mount_ra": 12.34,
 *  "command_params/mount_dec": 56.78,
 *  ...
 *  "user_interface/selected_subpage": "home",
 *  "user_interface/selected_target_tab": "telescope_controls"
 *  ...
 * }
 *
 * @param Object store: the full vuex store
 * @returns Object
 */
function createFullStateSnapshot (store) {
  // We're only syncing a subset of the vuex store, so first select the state of interest.
  // For now, it's almost everything in command_params and user_interface.
  const vuexModulesToSync = ['command_params', 'user_interface', 'site_config']

  // This array will hold objects with a single key/val for each state datum.
  let fullStateArray = []

  // Populate fullStateArray
  vuexModulesToSync.forEach(moduleName => {
    // gather the array of { key: val } elements separately for each vuex module
    const moduleArray = Object.keys(store.state[moduleName]).map(key => {
      const mutationName = `${moduleName}/${key}`
      return { [mutationName]: store.state[moduleName][key] }
    })
    // then add them to the full array
    fullStateArray = [...fullStateArray, ...moduleArray]
  })

  // From this array, create a single object that contains all the key/val pairs
  const fullStateSnapshotObject = fullStateArray.reduce((accumulator, currentValue) => {
    return Object.assign(accumulator, currentValue)
  }, {})

  // Finally, remove any specific values we don't want to sync
  const doNotSyncTheseKeys = [
    'site_config/test_sites',
    'site_config/global_config',
    'site_config/is_site_selected',
    'site_config/did_config_load_yet',
    'site_config/selected_site',
    'site_config/prev_selected_site',
    'site_config/selector_exists'
  ]
  doNotSyncTheseKeys.forEach(key => {
    delete fullStateSnapshotObject[key]
  })

  return fullStateSnapshotObject
}

export default UiSyncPlugin
