import React, { useRef, useEffect } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

const App = () => {
  const viewer = useRef(null);

  // if using a class, equivalent of componentDidMount 
  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        fullAPI: true,
        initialDoc: '/files/PDFTRON_about.pdf',
      },
      viewer.current,
    ).then((instance) => {
      const { documentViewer, annotationManager, Annotations, PDFNet } = instance.Core;

    });
  }, []);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
