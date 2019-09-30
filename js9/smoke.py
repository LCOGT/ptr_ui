""" smoke.py: smoke tests for JS9, calling much of the public API """
import time
import sys
import json
import pyjs9

def sleep(timeout=1):
    """
    sleep, usually for 1 second
    """
    time.sleep(timeout)

def waitStatus(j, wtype='Load'):
    """
    wait for JS9 status to be complete
    """
    timeout = 1
    curIter = 0
    maxIter = 60
    done = False
    while not done:
        stat = j.GetStatus(wtype)
        if stat == "complete":
            done = True
        else:
            curIter = curIter + 1
            if curIter > maxIter:
                raise ValueError("timeout waiting")
            time.sleep(timeout)

def init():
    """
    connect to the js9 helper, reset some JS9 states
    """
    if len(sys.argv) > 1:
        xid = sys.argv[1]
    else:
        xid = "JS9"
    j = pyjs9.JS9(id=xid)
    displayMessage(j, 'Start pyjs9.JS9(id={})'.format(xid))
    j.BlendDisplay(False)
    j.SetRGBMode(False)
    closeDisplay(j)
    return j

def displayMessage(j, s):
    """
    display message in the terminal and on JS9 display
    """
    if j:
        j.DisplayMessage("info", s.replace(" ", "&nbsp;").replace("j.", "", 1))
    print("    " + s)

def closeDisplay(j):
    """
    close display (all images in a given display)
    """
    displayMessage(j, 'j.CloseDisplay()')
    j.CloseDisplay()

def closeImage(j):
    """
    close currently displayed image
    """
    displayMessage(j, 'j.CloseImage()')
    j.CloseImage()

def loadImage(j, im, opts):
    """
    load an image and wait for completion
    """
    displayMessage(j, "j.Load(%s, ...)" % im)
    j.Load(im, opts)
    waitStatus(j)

def pixTest(j, file=None):
    """
    pixel conversion
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"log", "colormap": "heat"}')
    displayMessage(j, 'j.GetImageData()')
    imdata = j.GetImageData(False)
    displayMessage(j,
                   "    id: %s type: %s width: %d height: %d bitpix: %d"
                   % (imdata["id"], imdata["imtab"],
                      imdata["width"], imdata["height"],
                      imdata["bitpix"]))
    displayMessage(j,
                   "    CRPIX: %f %f: CRVAL: %f %f"
                   % (imdata["header"]["CRPIX1"], imdata["header"]["CRPIX2"],
                      imdata["header"]["CRVAL1"], imdata["header"]["CRVAL2"]))
    displayMessage(j, "j.WCSToPix(CRVAL1, CRVAL2)")
    obj = j.WCSToPix(imdata["header"]["CRVAL1"], imdata["header"]["CRVAL2"])
    abs1 = abs(obj["x"] - imdata["header"]["CRPIX1"])
    abs2 = abs(obj["y"] - imdata["header"]["CRPIX2"])
    if abs1 < 1 and abs2 < 1:
        displayMessage(j, "    %f %f" % (obj["x"], obj["y"]))
    else:
        raise ValueError("wrong WCSToPix")
    displayMessage(j, "j.ImageToDisplayPos(obj.x, obj.y)")
    dpos = j.ImageToDisplayPos({"x": obj["x"], "y": obj["y"]})
    displayMessage(j, "    %f %f" % (dpos["x"], dpos["y"]))
    displayMessage(j, "j.DisplayToImagePos(dpos.x, dpos.y)")
    ipos = j.DisplayToImagePos({"x": dpos["x"], "y": dpos["y"]})
    displayMessage(j, "    %f %f" % (ipos["x"], ipos["y"]))
    displayMessage(j, "j.PixToWCS(CRPIX1, CRPIX2)")
    obj = j.PixToWCS(imdata["header"]["CRPIX1"], imdata["header"]["CRPIX2"])
    abs1 = abs(obj["ra"] - imdata["header"]["CRVAL1"])
    abs2 = abs(obj["dec"] - imdata["header"]["CRVAL2"])
    if abs1 < 0.001 and abs2 < 0.001:
        displayMessage(j, "    %f %f" % (obj["ra"], obj["dec"]))
    else:
        raise ValueError("wrong WCSToPix")
    displayMessage(j, 'j.GetValPos(ipos)')
    valpos = j.GetValPos(ipos, False)
    displayMessage(j, '    %s'
                   % valpos["vstr"].replace("&nbsp;&nbsp;&nbsp;&nbsp;", " "))
    sleep()

def headerTest(j, file=None):
    """
    get header
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"log", "colormap": "heat"}')
    displayMessage(j, 'j.GetFITSHeader(True)')
    header = j.GetFITSHeader(True).split("\n")
    displayMessage(j, "    found %d cards" % len(header))
    sleep()

def binTest(j, file=None):
    """
    bin an image (binary table)
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"log", "colormap": "heat"}')
    for i in [2, 4, 8, 4, 2, 1]:
        if i in (2, 8):
            xfilter = "pi == pha"
        else:
            xfilter = ""
        displayMessage(j, 'j.DisplaySection(bin: %d, filter: %s)'
                       % (i, xfilter))
        j.DisplaySection({"bin":i, "filter": xfilter})
        waitStatus(j, "DisplaySection")

def rotateTest(j, file=None):
    """
    rotate an image
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"log", "colormap": "heat"}')
    displayMessage(j, 'j.RotateData(45)')
    j.RotateData(45)
    waitStatus(j, "ReprojectData")
    sleep()
    displayMessage(j, 'j.RotateData(0)')
    j.RotateData(0)
    waitStatus(j, "ReprojectData")
    sleep()

def filterRGBTest(j, file=None):
    """
    image processing filters (changes RGB data, not image data)
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"log", "colormap": "heat"}')
    displayMessage(j, 'j.FilterRGBImage("emboss")')
    j.FilterRGBImage("emboss")
    sleep()

def loadWindowTest(j, xfrom, xto):
    """
    load a new window, move image to/from
    """
    displayMessage(j, 'j.LoadWindow({"id": "%s"}, "light")' % xto)
    j.LoadWindow("",
                 {"id": xto, "clone": xfrom},
                 "light",
                 "",
                 "width=512px,height=598px,resize=1,scrolling=1")
    sleep()
    displayMessage(j, 'j.MoveToDisplay("%s")' % xto)
    j.MoveToDisplay(xto)
    sleep()
    displayMessage(j, 'j.MoveToDisplay(%s, "{display: %s"})' % (xfrom, xto))
    j.MoveToDisplay(xfrom, {"display": xto})
    sleep()

def wcsTest(j, file=None):
    """
    change WCS system and units
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.GetImageData()')
    imdata = j.GetImageData(False)
    displayMessage(j,
                   "    id: %s type: %s width: %d height: %d bitpix: %d"
                   % (imdata["id"], imdata["imtab"],
                      imdata["width"], imdata["height"], imdata["bitpix"]))
    displayMessage(j, 'j.GetWCSSys()')
    sysstr = j.GetWCSSys()
    displayMessage(j, 'j.GetWCSUnits()')
    unitsstr = j.GetWCSUnits()
    displayMessage(j, "    sys: %s units: %s" % (sysstr, unitsstr))
    displayMessage(j, 'j.SetWCSSys("galactic")')
    j.SetWCSSys("galactic")
    if j.GetWCSSys() != "galactic":
        raise ValueError("wrong wcs sys")
    displayMessage(j, 'j.SetWCSSys("native")')
    j.SetWCSSys("native")
    displayMessage(j, 'j.SetWCSUnits("degrees")')
    j.SetWCSUnits("degrees")
    if j.GetWCSUnits() != "degrees":
        raise ValueError("wrong wcs units")
    sleep()
    displayMessage(j, 'j.SetWCSUnits("sexagesimal")')
    j.SetWCSUnits("sexagesimal")
    sleep()

def countsTest(j, file=None):
    """
    internal counts in regions routine
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.AddRegions("circle")')
    j.AddRegions("circle")
    displayMessage(j, 'j.CountsinRegions()')
    s = j.CountsInRegions("$sregions", {"cmdswitches":"-j"})
    obj = json.loads(s)
    c = obj["backgroundSubtractedResults"][0]["netCounts"]
    displayMessage(j, "    counts: %f" % c)
    if c != 16703.0:
        raise ValueError("wrong counts")
    displayMessage(j, 'j.RemoveRegions()')
    j.RemoveRegions()

def colormapTest(j, file=None):
    """
    change colormap in various ways
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    cmap = "cmaps/purple_mm.cmap"
    displayMessage(j, 'j.LoadColormap(%s)' % cmap)
    j.LoadColormap(cmap)
    displayMessage(j, 'j.AddColormap("cyan")')
    j.AddColormap("cyan",
                  [[0, 0], [0, 0]], [[0, 0], [1, 1]], [[0, 0], [1, 1]],
                  {"toplevel": False})
    displayMessage(j, 'j.SetColormap(3.4, 0.15)')
    j.SetColormap(3.4, 0.15)
    sleep()
    color0 = j.GetParam("colormap")
    displayMessage(j, 'j.SetColormap("purplish")')
    j.SetColormap("purplish")
    sleep()
    displayMessage(j, 'j.GetParam("colormap")')
    cmap = j.GetParam("colormap")
    displayMessage(j, '    colormap: %s' % j.GetColormap())
    displayMessage(j, 'j.SetParam("colormap", "cyan")')
    j.SetParam("colormap", "cyan")
    displayMessage(j, '    colormap: %s' % j.GetColormap())
    sleep()
    displayMessage(j, 'j.SetParam("colormap", color0)')
    j.SetParam("colormap", color0)
    cmap = j.GetParam("colormap")
    displayMessage(j, '    colormap: %s' % j.GetColormap())
    j.SetColormap(color0)
    sleep()

def regionsTest(j, file=None):
    """
    manipulate regions
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.LoadRegions("casa/casa.reg")')
    j.LoadRegions("casa/casa.reg")
    waitStatus(j, "LoadRegions")
    displayMessage(j, 'j.GetRegions()')
    obj = j.GetRegions()
    if len(obj) == 6:
        displayMessage(j, "    found 6 regions")
    else:
        raise ValueError("incorrect number of regions")
    displayMessage(j, 'j.ChangeRegions()')
    j.ChangeRegions("text", {"color": "cyan"})
    sleep()
    displayMessage(j, 'j.RemoveRegions()')
    j.RemoveRegions("text")
    sleep()
    displayMessage(j, 'j.UnremoveRegions()')
    j.UnremoveRegions()
    sleep()

def shapesTest(j, file=None):
    """
    manipulate shapes (like regions, but in arbitrary layers)
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.NewShapeLayer("reg2")')
    j.NewShapeLayer("reg2")
    displayMessage(j, 'j.AddShapes("reg2" "box, circle")')
    # pylint: disable=line-too-long
    j.AddShapes("reg2", 'ICRS; box(23:23:12.7,+58:51:07.6,29",29",0); circle(23:23:35.2,+58:50:04.6, 14")')
    displayMessage(j, 'j.GetShapes("reg2")')
    obj = j.GetShapes("reg2")
    if len(obj) == 2:
        displayMessage(j, '    added 2 shapes')
    else:
        raise ValueError("incorrect number of shapes")
    displayMessage(j, 'j.ChangeShapes("reg2", {"color": "red"})')
    j.ChangeShapes("reg2", {"color": "red"})
    sleep()
    displayMessage(j, 'j.ShowShapeLayer("reg2", False)')
    j.ShowShapeLayer("reg2", False)
    sleep()
    displayMessage(j, 'j.ShowShapeLayer("reg2", True)')
    j.ShowShapeLayer("reg2", True)
    sleep()
    displayMessage(j, 'j.RemoveShapes("reg2")')
    j.RemoveShapes("reg2")
    sleep()

def catalogTest(j, file=None):
    """
    load a catalog
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.LoadCatalog("cat", "casa/casa.cat")')
    j.LoadCatalog("cat", "casa/casa.cat")
    waitStatus(j, "LoadRegions")
    sleep()

def flipTest(j, file=None):
    """
    flip an image
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.SetFlip(y)')
    j.SetFlip("y")
    displayMessage(j, 'j.GetFlip()')
    obj = j.GetFlip()
    if obj == "y":
        displayMessage(j, '    flip: y')
    else:
        raise ValueError("incorrect flip")
    waitStatus(j, "DisplaySection")
    sleep()

def blurTest(j, file=None):
    """
    gause blur
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.GaussBlurData(2)')
    j.GaussBlurData(2)
    sleep()

def panTest(j, file=None):
    """
    get and set pan
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.SetPan({"px": 4006, "py": 3928})')
    j.SetPan({"px": 4006, "py": 3928})
    displayMessage(j, 'j.GetPan()')
    obj = j.GetPan()
    if abs(obj["x"] - 1958) > 2 or (obj["y"] - 2216) > 2:
        raise ValueError("incorrect pan")
    sleep()

def gridTest(j, file=None):
    """
    display coord grid
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"cool"}')
    displayMessage(j, 'j.DisplayCoordGrid(True)')
    j.DisplayCoordGrid(True)
    sleep()
    displayMessage(j, 'j.DisplayCoordGrid(False)')
    j.DisplayCoordGrid(False)
    sleep()

def cubeTest(j, file=None):
    """
    display 3D cube data
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"log","colormap":"viridis"}')
    for i in range(2, 6):
        sleep()
        displayMessage(j, 'j.DisplaySlice(%d)' % i)
        j.DisplaySlice(i)
        waitStatus(j, "DisplaySection")
    sleep()

def analysisTest(j, file=None):
    """
    run an server-side analysis test
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"log","colormap":"viridis"}')
    displayMessage(j, 'j.GetAnalysis()')
    x = j.GetAnalysis()
    displayMessage(j, '    found %d analysis routines' % len(x))
    displayMessage(j, 'j.RunAnalysis("counts")')
    x = j.RunAnalysis("counts").split("\n")[13].split()[1]
    if abs(float(x) - 1211) < 0.01:
        displayMessage(j, "    counts: %s" % x)
    else:
        raise ValueError("incorrect counts")
    sleep()

def extTest(j, file=None):
    """
    multi-extension FITS
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"viridis"}')
    for i in range(3, 5):
        sleep()
        displayMessage(j, 'j.DisplayExtension(%d)' % i)
        j.DisplayExtension(i)
        waitStatus(j, "DisplaySection")
    sleep()

def xmmProxyTest(j):
    """
    retrieve data from XMM archive, blend and display
    """
    # pylint: disable=line-too-long
    xmmurl = "http://nxsa.esac.esa.int/nxsa-sl/servlet/data-action-aio?obsno=0791580701&name=3COLIM&level=PPS&extension=FTZ"
    closeImage(j)
    displayMessage(j, "load xmm archive via proxy ...")
    j.LoadProxy(xmmurl,
                {"colormap":"red", "scale":"log", "contrast":6.3, "bias": 0.1})
    waitStatus(j)
    displayMessage(j, 'j.DisplaySlice(2)')
    j.DisplaySlice(2,
                   {"separate": True, "colormap":"green", "scale":"log",
                    "contrast":6.625, "bias":0.15})
    sleep()
    displayMessage(j, 'j.DisplaySlice(3)')
    j.DisplaySlice(3,
                   {"separate": True, "colormap":"blue", "scale":"log",
                    "contrast":7.025, "bias":0.195})
    sleep()
    displayMessage(j, 'j.SetRGBMode(True)')
    j.SetRGBMode(True)
    sleep(4)
    displayMessage(j, 'j.SetRGBMode(False)')
    j.SetRGBMode(False)
    sleep()
    closeDisplay(j)

def mosaicTest(j, file=None):
    """
    create a mosaic from a file
    """
    if file:
        closeImage(j)
        loadImage(j, file, '{"scale":"linear","colormap":"viridis"}')
    displayMessage(j, 'j.CreateMosaic("current")')
    j.CreateMosaic("current")
    waitStatus(j, "CreateMosaic")
    displayMessage(j, 'j.SetColormap("magma", 5.13, 0.04)')
    j.SetColormap("magma", 5.13, 0.04)
    displayMessage(j, 'j.DisplayPlugin("JS9Panner")')
    j.DisplayPlugin("JS9Panner");
    sleep(2)
    displayMessage(j, 'j.DisplayPlugin("panner")')
    j.DisplayPlugin("panner");
    closeDisplay(j)

# pylint: disable=too-many-statements
def blendTest(j):
    """
    blend images
    """
    closeDisplay(j)
    j.BlendDisplay(False)
    loadImage(j, 'blend/chandra.fits',
              '{"scale":"linear","colormap":"sls","contrast":5.78,"bias":0.15}')
    displayMessage(j, 'j.SetScale(log)')
    j.SetScale("log")
    displayMessage(j, 'j.GetScale()')
    obj = j.GetScale()
    if obj["scale"] != "log":
        raise ValueError("incorrect scale")
    displayMessage(j, 'j.SetZoom(2)')
    j.SetZoom(2)
    displayMessage(j, 'j.GetZoom()')
    val = j.GetZoom()
    if val != 2:
        raise ValueError("incorrect zoom")
    displayMessage(j, 'j.SetColormap("red")')
    j.SetColormap("red")
    displayMessage(j, 'j.GetColormap()')
    obj = j.GetColormap()
    if obj["colormap"] != "red":
        raise ValueError("incorrect colormap")
    displayMessage(j, 'j.BlendImage("screen", 1, True)')
    j.BlendImage('screen', 1, True)
    sleep()

    # pylint: disable=line-too-long
    loadImage(j, 'blend/galex.fits',
              '{"scale":"log","colormap":"green","contrast":6.25,"bias":0.25}')
    displayMessage(j, 'j.ReprojectData("chandra.fits")')
    j.ReprojectData('chandra.fits')
    waitStatus(j, "ReprojectData")
    displayMessage(j, 'j.SetColormap("green", 5.6, 0.74)')
    j.SetColormap('green', 5.6, 0.74)
    displayMessage(j, 'j.SetZoom(2)')
    j.SetZoom(2)
    displayMessage(j, 'j.BlendImage("screen", 1, True)')
    j.BlendImage('screen', 1, True)
    sleep()

    # pylint: disable=line-too-long
    loadImage(j, 'blend/spitzer.fits', '{"scale":"log","colormap":"blue","contrast":6.3,"bias":0.54}')
    displayMessage(j, 'j.ReprojectData("chandra.fits")')
    j.ReprojectData('chandra.fits')
    waitStatus(j, "ReprojectData")
    displayMessage(j, 'j.SetColormap("blue", 6.3, 0.54)')
    j.SetColormap('blue', 6.3, 0.54)
    displayMessage(j, 'j.SetZoom(2)')
    j.SetZoom(2)
    displayMessage(j, 'j.BlendImage("screen", 1, True)')
    j.BlendImage('screen', 1, True)
    sleep()

    # pylint: disable=line-too-long
    loadImage(j, 'blend/hst.fits', '{"scale":"log","scaleclipping":"user","scalemin":0,"scalemax":5,"colormap":"heat","contrast":4.0,"bias":0.67}')
    displayMessage(j, 'j.ReprojectData("chandra.fits")')
    j.ReprojectData('chandra.fits')
    waitStatus(j, "ReprojectData")
    displayMessage(j, 'j.SetColormap("heat", 3.0, 0.535)')
    j.SetColormap('heat', 3.0, 0.535)
    displayMessage(j, 'j.SetZoom(2)')
    j.SetZoom(2)
    displayMessage(j, 'j.BlendImage("screen", 1, True)')
    j.BlendImage('screen', 1, True)
    displayMessage(j, 'j.Addregions("ellipse; circle")')
    j.AddRegions('FK5; ellipse(06:16:27.2, -21:22:31.1, 35.97", 19.19", 20.25) {"color":"cyan"}; circle(06:16:22.1, -21:22:22.8, 14.8")')
    displayMessage(j, 'j.GetRegions()')
    obj = j.GetRegions()
    if len(obj) != 2:
        raise ValueError("incorrect number of regions")
    displayMessage(j, 'j.CopyRegions("chandra.fits")')
    j.CopyRegions("chandra.fits")
    displayMessage(j, 'j.RemoveRegions()')
    j.RemoveRegions()
    displayMessage(j, 'blend the images ...')
    displayMessage(j, 'j.BlendDisplay(True)')
    j.BlendDisplay(True)
    sleep()
    displayMessage(j, 'j.GetDisplayData()')
    imarr = j.GetDisplayData()
    for imdata in imarr:
        displayMessage(j, "    id: %s type: %s width: %d height: %d bitpix: %d"
                       % (imdata["id"], imdata["imtab"],
                          imdata["width"], imdata["height"], imdata["bitpix"]))
    displayMessage(j, 'j.DisplayImage("chandra.fits")')
    j.DisplayImage("colormap", {"display":"chandra.fits"})
    sleep()

def resizeSeparateTest(j):
    """
    resize display, separate, gather images in a display
    """
    displayMessage(j, 'gather, resize ...')
    displayMessage(j, 'j.ResizeDisplay(400,300)')
    j.ResizeDisplay(300, 300)
    sleep()
    displayMessage(j, 'j.SeparateDisplay()')
    j.SeparateDisplay()
    sleep(2)
    displayMessage(j, 'j.GatherDisplay()')
    j.GatherDisplay()
    sleep(2)
    displayMessage(j, 'j.ResizeDisplay("reset")')
    j.ResizeDisplay("reset")

def smokeTests():
    """
    all the tests
    """
    j = init()
    pixTest(j, "fits/snr.fits")
    headerTest(j)
    binTest(j)
    rotateTest(j)
    filterRGBTest(j)
    loadWindowTest(j, "JS9", "myJS9")
    wcsTest(j, "fits/casa.fits")
    countsTest(j)
    colormapTest(j)
    regionsTest(j)
    shapesTest(j)
    catalogTest(j)
    flipTest(j)
    blurTest(j)
    panTest(j)
    gridTest(j)
    xmmProxyTest(j)
    cubeTest(j, "fits/jupiter_cube.fits")
    analysisTest(j)
    extTest(j, "fits/nicmos.fits")
    mosaicTest(j, "fits/mosaicimage.fits")
    blendTest(j)
    resizeSeparateTest(j)
    j.close()
    sys.exit()

if __name__ == '__main__':
    smokeTests()
