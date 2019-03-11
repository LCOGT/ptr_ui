<template>
    <div id='dome-cam' />
</template>

<script>

export default {
    name: 'DomeCam',
    mounted () {
        var dome_cam_address = '10.15.0.19';
        var BaseURL = "http://"+dome_cam_address+"/";
        var Camera = ""; // If you use an AXIS 240Q/241S(A)/241Q(A)/243SA, comment away this line by inserting "//"
        // var Camera = "n"; // Change n to the Video source used in the AXIS 240Q/ 241S(A)/241Q(A)/243SA and remove "//"

        var ImageResolution = "480x270"; var DisplayWidth = "480";var DisplayHeight = "270";
        // This is the path to the image generating file inside the camera itself
        var File = "axis-cgi/mjpg/video.cgi?resolution="+ImageResolution;
        // No changes required below this point
        if (Camera != "") {File += "&camera=" + Camera;}
        var output = "";
        if ((navigator.appName == "Microsoft Internet Explorer") &&
        (navigator.platform != "MacPPC") && (navigator.platform != "Mac68k"))
        {
        // If Internet Explorer under Windows then use ActiveX
        output = '<OBJECT ID="Player" width='
        output += DisplayWidth;
        output += ' height=';
        output += DisplayHeight;
        output += ' CLASSID="CLSID:DE625294-70E6-45ED-B895-CFFA13AEB044" ';
        output += 'CODEBASE="';
        output += BaseURL;
        output += 'activex/AMC.cab">';
        output += '<PARAM NAME="MediaURL" VALUE="';
        output += BaseURL;
        output += File + '">';
        output += '<param name="MediaType" value="mjpeg-unicast">';
        output += '<param name="ShowStatusBar" value="0">';
        output += '<param name="ShowToolbar" value="1">';
        output += '<param name="AutoStart" value="1">';
        output += '<param name="StretchToFit" value="1">';
        output += '<BR><B>Axis Media Control</B><BR>';
        output += 'The AXIS Media Control, which enables you ';
        output += 'to view live image streams in Microsoft Internet';
        output += ' Explore'
        output += '<BR></OBJECT>';
        } else {
        // If not IE for Windows use the browser itself to display
        let theDate = new Date();
        output = '<IMG SRC="';
        output += BaseURL;
        output += File;
        output += '&dummy=' + theDate.getTime().toString(10);
        //output += '" HEIGHT="';
        //output += DisplayHeight;
        //output += '" WIDTH="';
        //output += DisplayWidth;
        output += '" class="img-fluid'
        output += '" ALT="Camera Image" style="width: 100%; object-fit: contain">';
        }
        document.getElementById('dome-cam').innerHTML = output;
    }
}
</script>