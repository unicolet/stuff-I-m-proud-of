#!/usr/bin/python
import xml.dom.minidom
import sys, string

def getText(element):
    rc = ""
    for node in element.childNodes:
        if node.nodeType == node.TEXT_NODE:
            rc = rc + string.strip(node.data)
    return rc
    
def setText(element, text):
    for node in element.childNodes:
        if node.nodeType == node.TEXT_NODE:
            node.data=text

if len(sys.argv)!=3:
    print "Usage: %s %s %s"%(sys.argv[0],"file","new_data_dir_value")
    print "WARNING: the file will be overwritten with the new value"
    sys.exit(1)

file=sys.argv[1]
newDataDir=sys.argv[2]
   
dom = xml.dom.minidom.parse(file)

dataParam=None
lastContextParam=None

for el in dom.getElementsByTagName("context-param"):
    lastContextParam=el
    text = getText(el.getElementsByTagName("param-name")[0])
    if text == "GEOSERVER_DATA_DIR":
        dataParam=el
        print "Found existing data dir param, setting it to: "+newDataDir
        setText(el.getElementsByTagName("param-value")[0], newDataDir)

if not dataParam:
    print "Not found, inserting after lastContextParam"
    ctxparam = dom.createElement('context-param')
    paramname=dom.createElement('param-name')
    paramname.appendChild(dom.createTextNode('GEOSERVER_DATA_DIR'))
    paramvalue=dom.createElement('param-value')
    paramvalue.appendChild(dom.createTextNode(newDataDir))
    ctxparam.appendChild(paramname)
    ctxparam.appendChild(paramvalue)
    lastContextParam.parentNode.insertBefore(ctxparam, lastContextParam.nextSibling)

output=open(file, "w")
output.write(dom.toxml())
output.close()

sys.exit(0)

