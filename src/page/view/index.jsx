import { useEffect, useRef, useState } from 'react';
import BpmnViewer from 'bpmn-js';
import demoXml from './bpmn-demo.bpmn?raw';


const View = () => {
  const container = useRef(null);
  const bpmn = useRef(null);
  const [selectNodes, setSelectNodes] = useState([]);

  useEffect(() => {
   if (!bpmn.current) {
    bpmn.current = new BpmnViewer({
      container: container.current
    });

    const eventBus = bpmn.current?.get('eventBus')
      eventBus.on('selection.changed', e => {
        setSelectNodes(e.newSelection);
      })
   }

   bpmn.current?.importXML(demoXml);
  }, []);

  useEffect(() => {
    if (selectNodes?.length) {
      const [ currentNode ] = selectNodes;

      console.log(currentNode);
      const {
        name,
        id,
        documentation,
        extensionElements,
        $type,
      } = currentNode.businessObject;
      console.log(name,
        id,
        documentation,
        extensionElements?.values,
        $type,);
    }
  }, [selectNodes]);

  return <div ref={container} style={{
      width: '100%',
      height: '100%'
    }}/>
};

export default View;