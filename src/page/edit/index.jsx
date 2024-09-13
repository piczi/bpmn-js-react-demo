import { useRef, useState } from 'react';
import { Radio } from 'antd';
import useBpmnModeler from './hooks';
// import diagramXML from './assets/pizza-collaboration.bpmn?raw';
import Highlight from './Highlight';
import './index.less';
import { useMemo } from 'react';
import ToolBar from './Toolbar';

console.log(window.location.pathname);

function Edit() {
    const container = useRef(null);
    const panelRef = useRef(null);
    const [type, setType] = useState('diagram');
    const [xml, setXml] = useState('');
    const { bpmn, getXml, selectNodes } = useBpmnModeler(container, panelRef);

    const onTypeChange = async (e) => {
      setType(e.target.value);
      if (e.target.value === 'xml') {
       const newXml = await getXml();
       setXml(newXml);
      }
    };
    const canvasStyle = useMemo(() => {
      return {
        display: type === 'diagram' ? 'flex' : 'none'
      };
    }, [type]);

    return (<div className='page'>
              <ToolBar bpmn={bpmn} show={type === 'diagram'} selectNodes={selectNodes}/>
              <div className='content' style={canvasStyle}>
                <div  ref={container} className='canvas' />
                <div ref={panelRef} className='properties'/>
              </div>
              {type === 'xml' && <Highlight code={xml} />}
              <Radio.Group
                onChange={onTypeChange}
                value={type}
                size='small' className='radio'>
                <Radio.Button value="diagram">Diagram</Radio.Button>
                <Radio.Button value="xml">XML</Radio.Button>
              </Radio.Group>
            </div>);
  }
export default Edit
