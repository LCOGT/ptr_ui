
var date = +new Date() / 86400000;

function elevation(coords) {

    const DEG2RAD = Math.PI / 180;
    const RAD2DEG = 180 / Math.PI;
    const d1 = (Math.PI * (401095163740318 * date + 11366224765515)) / 200000000000000;



    let [ra, dec] = coords;
    ra = ra * DEG2RAD * 15;
    dec = dec * DEG2RAD;
    let lat = DEG2RAD * 34;
    let lon = DEG2RAD * -119;
    

    let answer = Math.atan(
        (
        (Math.sin(ra) * Math.sin(lat)) 
        - 
        (Math.cos(dec) * Math.cos(lat) * Math.sin(d1+lon-ra))
        )
        
        /
        (
            Math.sqrt(
            Math.pow( 
                (Math.cos(dec) * Math.sin(lat) * Math.sin(d1+lon-ra))
                + 
                (Math.sin(dec) * Math.cos(lat)), 2) 
            + 
            (Math.pow(Math.cos(dec),2) * Math.pow(Math.cos(d1+lon-ra),2))
            )
        )
    )

    return answer * RAD2DEG
}



function elevation(coords) {

    const DEG2RAD = Math.PI / 180;
    const RAD2DEG = 180 / Math.PI;
    const d1 = (Math.PI * (401095163740318 * date + 11366224765515)) / 200000000000000;



    let [ra, dec] = coords;
    ra = ra * DEG2RAD * 15;
    dec = dec * DEG2RAD;
    let lat = DEG2RAD * 34;
    let lon = DEG2RAD * -119;
    

    let answer = Math.atan( ( (Math.sin(ra) * Math.sin(lat)) - (Math.cos(dec) * Math.cos(lat) * Math.sin(d1+lon-ra))) / ( Math.sqrt( Math.pow( (Math.cos(dec) * Math.sin(lat) * Math.sin(d1+lon-ra)) + (Math.sin(dec) * Math.cos(lat)), 2) + (Math.pow(Math.cos(dec),2) * Math.pow(Math.cos(d1+lon-ra),2)))))

    return answer * RAD2DEG
}


coordinates = []
for(let i=0; i<24; i+=0.5) {
    for (let j=0; j<90; j+=1) {
        coordinates.push([i,j]);
    }
}



function function1() {
    for (let z=0;z<100;z++){
        let coordinates = []
        for(let i=0; i<24; i+=0.5) {
            for (let j=0; j<90; j+=1) {
                coordinates.push([i,j]);
            }
        }
        coordinates.map(elevation)
    }
    return true
}

var start = +new Date();

function1();

var end = +new Date();

var diff = end - start

console.log(start)
console.log(end)
console.log(diff)



function coord_to_horizon( utc, ra, dec, lat, lon )
{
    // compute hour angle in degrees
    //var ha = mean_sidereal_time( utc, lon ) - ra;
    var ha =  3.7 - ra;
    if (ha < 0) ha = ha + 360;

    // convert degrees to radians
    ha  = ha*Math.PI/180
    dec = dec*Math.PI/180
    lat = lat*Math.PI/180

    // compute altitude in radians
    var sin_alt = Math.sin(dec)*Math.sin(lat) + Math.cos(dec)*Math.cos(lat)*Math.cos(ha);
    var alt = Math.asin(sin_alt);
    
    // compute azimuth in radians
    // divide by zero error at poles or if alt = 90 deg
    var cos_az = (Math.sin(dec) - Math.sin(alt)*Math.sin(lat))/(Math.cos(alt)*Math.cos(lat));
    var az  = Math.acos(cos_az);

    // convert radians to degrees
    hrz_altitude = alt*180/Math.PI;
    hrz_azimuth  = az*180/Math.PI;

    // choose hemisphere
    if (Math.sin(ha) > 0) hrz_azimuth = 360 - hrz_azimuth;
}

// Compute the Mean Sidereal Time in units of degrees. 
// Use lon := 0 to get the Greenwich MST. 
// East longitudes are positive; West longitudes are negative
// returns: time in degrees
function mean_sidereal_time(now, lon)
{
    var year   = now.getUTCFullYear();
    var month  = now.getUTCMonth() + 1;
    var day    = now.getUTCDate();
    var hour   = now.getUTCHours();
    var minute = now.getUTCMinutes();
    var second = now.getUTCSeconds();

    if ((month == 1)||(month == 2))
    {
        year  = year - 1;
        month = month + 12;
    }

    var a = Math.floor(year/100);
    var b = 2 - a + Math.floor(a/4);
    var c = Math.floor(365.25*year);
    var d = Math.floor(30.6001*(month + 1));

    // days since J2000.0
    var jd = b + c + d - 730550.5 + day + (hour + minute/60.0 + second/3600.0)/24.0;
    
    // julian centuries since J2000.0
    var jt = jd/36525.0;

    // the mean sidereal time in degrees
    var mst = 280.46061837 + 360.98564736629*jd + 0.000387933*jt*jt - jt*jt*jt/38710000 + lon;

    // in degrees modulo 360.0
    if (mst > 0.0) 
        while (mst > 360.0) mst = mst - 360.0;
    else
        while (mst < 0.0)   mst = mst + 360.0;
        
    return mst;
}



button_action_model = {
    GOTO: {
        Select_object: [
            'show popular visible targets',
            'filter by type X',
        ]
    },
    EXPOSE: {
        filter: [
            'select XXX filter',
        ],
        time: [
            'take 1 second image',
            'take 10 second image',
            'take 1 minute image',
            'take 5 minute image',
            'take 10 minute image',
        ],
    },
    FOCUS: [
        'GOTO good focus star',
        'autofocus',
        'focus IN by X microns',
        'focus OUT by X microns',
        'default focus',
    ]
        
}