import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
const Light = ({ code }) => {
  return (
    <SyntaxHighlighter
    wrapLongLines
      language="xml" style={{
        ...a11yLight,
        margin: 0,
      }}>
      {code}
    </SyntaxHighlighter>
  );
};

export default Light;
