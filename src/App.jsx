// import diagramXML from './assets/pizza-collaboration.bpmn?raw';
import Edit from './page/edit';
import View from './page/view';
import './App.css';

console.log(window.location.pathname);

function App() {
    if (window.location.pathname === '/') {
      return <Edit />;
    }

    if (window.location.pathname === '/view') {
      return <div style={{
        width: '100vw',
        height: '100vh',
      }}><View /></div>
    }

    return 'Hello bpmn-js';
  }
export default App
