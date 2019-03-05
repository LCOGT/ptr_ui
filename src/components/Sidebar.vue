<template>
  <sidebar-menu :menu="menu" />
</template>

<script>
    export default {
        name: 'Sidebar',
        data() {
            return {
                menu: [
                    {
                        header: true,
                        title: 'Main Navigation',
                        // component: componentName
                        // visibleOnCollapse: true
                    },
                    {
                        href: '/',
                        title: 'Dashboard',
                        icon: 'fa fa-user',
                        /*
                        disabled: true
                        badge: {
                            text: 'new',
                            // class:''
                        }
                        */
                    },
                    {
                        title: 'Charts',
                        icon: 'fa fa-chart-area',
                        child: [
                            {
                                href: '/charts/sublink',
                                title: 'Sub Link',
                            }
                        ]
                    }
                ]
            }
        },
        methods: {
            
        }
    }
</script>