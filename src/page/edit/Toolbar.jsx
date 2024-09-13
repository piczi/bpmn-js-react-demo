import { useState, useRef } from 'react';
import { message } from 'antd';
import { CaretDownOutlined, ZoomInOutlined, ZoomOutOutlined, CopyOutlined, SnippetsOutlined } from '@ant-design/icons';
import './Toolbar.css';

const COLORS = [{
  title: 'White',
  fill: 'white',
  stroke: 'black'
}, {
  title: 'Blue',
  fill: 'rgb(187, 222, 251)',
  stroke: 'rgb(30, 136, 229)'
}, {
  title: 'Orange',
  fill: 'rgb(255, 224, 178)',
  stroke: 'rgb(251, 140, 0)'
}, {
  title: 'Green',
  fill: 'rgb(200, 230, 201)',
  stroke: 'rgb(67, 160, 71)'
}, {
  title: 'Red',
  fill: 'rgb(255, 205, 210)',
  stroke: 'rgb(229, 57, 53)'
}, {
  title: 'Purple',
  fill: 'rgb(225, 190, 231)',
  stroke: 'rgb(142, 36, 170)'
}];

const createReviver = (moddle) => {
  var elCache = {}
  /**
   * The actual reviewer that creates model instances
   * for elements with a $type attribute.
   *
   * Elements with ids will be re-used, if already
   * created.
   *
   * @param  {String} key
   * @param  {Object} object
   *
   * @return {Object} actual element
   */
  return function (key, object) {
    if (typeof object === 'object' && typeof object.$type === 'string') {
      var objectId = object.id

      if (objectId && elCache[objectId]) {
        return elCache[objectId]
      }

      var type = object.$type
      var attrs = Object.assign({}, object)

      delete attrs.$type

      var newEl = moddle.create(type, attrs)

      if (objectId) {
        elCache[objectId] = newEl
      }

      return newEl
    }

    return object
  }
}

const downloadHandle = (data, type, name) => {
  const xmlBlob = new Blob([data], {
    type
  })

  const downloadLink = document.createElement('a')
  downloadLink.download = name;
  downloadLink.innerHTML = 'Get BPMN SVG'
  downloadLink.href = window.URL.createObjectURL(xmlBlob)
  downloadLink.onclick = function (event) {
    document.body.removeChild(event.target)
  }
  downloadLink.style.visibility = 'hidden'
  document.body.appendChild(downloadLink)
  downloadLink.click()
};

function Toolbar(props) {
    const [showColor, setShowColor] = useState(false);
    const [scale, setScale] = useState(1);
    const { show, bpmn, selectNodes } = props || {};

    /**
     * 导入xml
     * @param {*} xml 
     */
    const updateXml = async (xml) => {
      await bpmn?.current?.importXML(xml || '')
      bpmn?.current?.get('canvas').zoom('fit-viewport', 'auto')
    }

    const saveXml = async () => {
      await bpmn?.current?.saveXML({ format: true });
      message.success('保存成功')
    };

   const saveBPMN = async () => {
      try {
        const result = await bpmn?.current?.saveXML({ format: true })
        const { xml } = result
        downloadHandle(xml, 'application/bpmn20-xml;charset=UTF-8,', `bpmn-${+new Date()}.bpmn`);
      } catch (err) {
        console.log(err)
      }
    };

    const saveSVG = async function () {
      try {
        const result = await bpmn?.current?.saveSVG()
        const { svg } = result;
        downloadHandle(svg, 'image/svg+xml', `bpmn-${+new Date()}.SVG`);
      } catch (err) {
        console.log(err)
      }
    };

    const redo = () => {
      bpmn.current?.get('commandStack').redo()
    };
    const undo = () => {
      bpmn.current?.get('commandStack').undo()
    };

    const setColor = (fill, stroke) => {
      if (!selectNodes?.length) return message.warning('请选择元素')
      const modeling = bpmn?.current?.get('modeling')
      selectNodes.map(element => {
        modeling.setColor(element, {
          fill,
          stroke
        })
      })
    };

    const alignElements = (position = 'center') => {
      if (!selectNodes.length) return message.warning('请选择元素');
      const alignElements = bpmn?.current?.get('alignElements')
      alignElements.trigger(selectNodes, position)
    };

    const distributeElements = (axis) => {
      if (!selectNodes?.length) return message.warning('请选择元素')
      const alignElements = bpmn.current?.get('distributeElements')
      alignElements.trigger(selectNodes, axis)
    };

    const handlerZoom = (radio) => {
      const newScale = Math.round((!radio ? 1.0 : scale + radio) * 10) / 10;
      bpmn.current?.get('canvas').zoom(newScale)
      setScale(newScale);
    };


    const refFile = useRef();
    

    const loadBPMN = async () => {
      const file = refFile.current?.files[0]
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onloadend = function (e) {
        updateXml(e.target?.result);
      }
    };

    const execCopy = () => {
      if (!selectNodes.length) return message.warning('请选择元素！');

      const clipboard = bpmn.current?.get('clipboard')
        const copyPaste =  bpmn.current?.get('copyPaste')
  
        // get element to be copied
  
        // copy!
        copyPaste.copy(selectNodes)
  
        // retrieve clipboard contents
        const copied = clipboard.get()
  
        // persist in local storage, encoded as json
        localStorage.setItem('bpmnClipboard', JSON.stringify(copied))
    };

    const execPaste = () => {
      // this.paste(modeler, 'Process_1', { x: 0, y: 0 })

      const clipboard = bpmn.current?.get('clipboard')
      const copyPaste = bpmn.current?.get('copyPaste')
      const elementRegistry = bpmn.current?.get('elementRegistry')
      const moddle = bpmn.current?.get('moddle')

      // retrieve from local storage
      const serializedCopy = localStorage.getItem('bpmnClipboard')

      // parse tree, reinstantiating contained objects
      const parsedCopy = JSON.parse(serializedCopy, createReviver(moddle))

      // put into clipboard
      clipboard.set(parsedCopy)

      const currentProcess = elementRegistry.find((ele) => {
        return ele.type?.includes('Process');
      })

      const pasteContext = {
        element: elementRegistry.get(currentProcess?.id),
        point: {x: 100, y: 100 }
      }

      // paste tree
      copyPaste.paste(pasteContext)
    };

    if (!show) return null;

    return (<div className="header-container">
      <i title="打开 diagram" className="bpmn-toolbar-icon bpmn-toolbar-icon-open" onClick={() => {
        refFile?.current?.click();
      }}/>|
      <i title="保存 diagram" className="bpmn-toolbar-icon bpmn-toolbar-icon-save" onClick={saveXml}/>
      <i title="导出 diagram" className="bpmn-toolbar-icon bpmn-toolbar-icon-save-as" onClick={saveBPMN}/>|
      <i title="复原" className="bpmn-toolbar-icon bpmn-toolbar-icon-undo" onClick={redo}/>
      <i title="撤销" className="bpmn-toolbar-icon bpmn-toolbar-icon-redo" onClick={undo}/>|
      <i title="导出为图片" className="bpmn-toolbar-icon bpmn-toolbar-icon-picture" onClick={saveSVG}/>|
      <i title="设置元素颜色" className="bpmn-toolbar-icon bpmn-toolbar-icon-set-color-tool" onClick={() => {
          setShowColor(!showColor)
        }}>
        <CaretDownOutlined style={{ marginLeft: 8 }}/>
        {showColor && <ul className="colorSelect">
          {COLORS.map(item => <li key={item.title}>
            <div className="colorBlock" style={{borderColor: item.stroke, backgroundColor: item.fill}} onClick={() => {
              setColor(item.fill, item.stroke);
            }}/>
          </li>)}
        </ul>}
      </i>|
      <i title="元素左对齐" className="bpmn-toolbar-icon bpmn-toolbar-icon-align-left-tool" onClick={() => {
        alignElements('left');
      }}/>
      <i title="元素垂直居中对齐" className="bpmn-toolbar-icon bpmn-toolbar-icon-align-center-tool" onClick={() => {
        alignElements('center');
      }}/>
      <i title="元素右对齐" className="bpmn-toolbar-icon bpmn-toolbar-icon-align-right-tool" onClick={() => {
        alignElements('right');
      }}/>
      <i title="元素顶部对齐" className="bpmn-toolbar-icon bpmn-toolbar-icon-align-top-tool" onClick={() => {
        alignElements('top');
      }}/>
      <i title="元素水平居中对齐" className="bpmn-toolbar-icon bpmn-toolbar-icon-align-middle-tool" onClick={() => {
        alignElements('middle');
      }}/>
      <i title="元素底部对齐" className="bpmn-toolbar-icon bpmn-toolbar-icon-distribute-vertical-tool" onClick={() => {
        alignElements('bottom');
      }}/>|
      <i title="水平分布元素" className="bpmn-toolbar-icon bpmn-toolbar-icon-distribute-horizontal-tool" onClick={() => {
        distributeElements('horizontal');
      }}/>
      <i title="垂直分布元素" className="bpmn-toolbar-icon bpmn-toolbar-icon-distribute-vertical-tool" onClick={() => {
        distributeElements('vertical');
      }}/>
      |
      <i title="放大" className="el-icon-zoom-in" onClick={() => {
        handlerZoom(0.1);
      }}>
        <ZoomInOutlined />
      </i>
      <i title="缩小" className="el-icon-zoom-out" onClick={() => {
        handlerZoom(-0.1);
      }}>
        <ZoomOutOutlined />
      </i>
      <i title="复制" className="el-icon-document-copy" onClick={execCopy}>
        <CopyOutlined />
      </i>
      <i title="粘贴" className="el-icon-document-add" onClick={execPaste}>
        <SnippetsOutlined />
      </i>
      <input
        type="file"
        ref={refFile}
        style={{ display: "none" }}
        onChange={loadBPMN}/>
    </div>);
  }
export default Toolbar;
