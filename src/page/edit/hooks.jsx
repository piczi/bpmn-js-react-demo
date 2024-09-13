import { useRef, useEffect, useState } from 'react';
// import BpmnViewer from 'bpmn-js';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import minimapModule from 'diagram-js-minimap';
import customTranslate from './translation';

import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/diagram-js.css' // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
// import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'
// import 'bpmn-js-properties-panel/styles/properties.less'
import '../../assets/panel.css';
import 'diagram-js-minimap/assets/diagram-js-minimap.css'
import {BpmnPropertiesProviderModule, BpmnPropertiesPanelModule, ZeebePropertiesProviderModule } from 'bpmn-js-properties-panel'
// import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json'
import ZeebeBehaviorsModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';
import zeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe';
import { xmlStr } from './xmlData.js';

const useBpmnModeler = (container, panel, basicXML = '') => {
  const bpmn = useRef(null);
  const [selectNodes, setSelectNodes] = useState([]);

  const customTranslateModule = {
    translate: ['value', customTranslate]
  }

  async function openDiagram(xml) {
    try {
      await bpmn.current?.importXML(xml || xmlStr);
  
      bpmn.current?.get('minimap')?.open();
  
      console.log('Awesome! Ready to navigate!');
  
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (container.current && !bpmn.current) {
      bpmn.current = new BpmnModeler({
        container: container.current,
        width: '100%',
        height: '100%',
        additionalModules: [
          minimapModule,
          BpmnPropertiesPanelModule,
          BpmnPropertiesProviderModule,
          ZeebePropertiesProviderModule,
          ZeebeBehaviorsModule,
          customTranslateModule,
        ],
        propertiesPanel: {
          parent: panel.current,
        },
        moddleExtensions: {
          // camunda: camundaModdleDescriptor,
          zeebe: zeebeModdle,
        }
      });

      const eventBus = bpmn.current?.get('eventBus')
      eventBus.on('selection.changed', e => {
        setSelectNodes(e.newSelection);
      })
    }
    openDiagram(basicXML);
  }, [container, basicXML]);

  const getXml = async () => {
    const res = await bpmn.current.saveXML({ format: true });
    return res.xml.toString();
  };

  return {
    bpmn,
    getXml,
    selectNodes,
  };
}

export default useBpmnModeler;