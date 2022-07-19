import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

const App = () => {
  const viewer = useRef(null);
  const [wvInstance, setWvInstance] = useState(null);

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
      setWvInstance(instance);
    });
  }, []);

  const transformFreeTextToPdfText = async () => {
    const { documentViewer, annotationManager, Annotations, PDFNet } = wvInstance.Core;

    // Get document from viewer and create PDFdoc with it
    const doc = documentViewer.getDocument();
    const data = await doc.getFileData();
    const arr = new Uint8Array(data);
    const PDFdoc = await PDFNet.PDFDoc.createFromBuffer(arr);

    // ElementBuilder is used to build new Element objects
    const eb = await PDFNet.ElementBuilder.create();
    // ElementWriter is used to write Elements to the page
    const writer = await PDFNet.ElementWriter.create();

    // Store color space + color point (used for text element)
    const colorspace = await PDFNet.ColorSpace.createDeviceRGB();
    // Black
    const color = await PDFNet.ColorPt.init(0, 0, 0, 0);
    // White
    // const color = await PDFNet.ColorPt.init(255, 255, 255, 0);

    // Get all annotations, filter only FreeTextAnnotation type
    const annotations = annotationManager
      .getAnnotationsList()
      .filter(
        (annotation) =>
          annotation instanceof Annotations.FreeTextAnnotation
      );

    // Loop through the FreeTextAnnotations, write element to page based on annotation data
    for (const annot of annotations) {
      eb.reset();

      let element;
      let gstate;

      const fontSize = 14;
      const page = await PDFdoc.getPage(annot.getPageNumber());
      const annotContents = annot.getContents();
      const yPos =
        (await page.getPageHeight()) - annot.getY() - fontSize; // Account for different coordinate system
      const xPos = annot.getX();

      await writer.beginOnPage(page);

      element = await eb.createTextBeginWithFont(
        await PDFNet.Font.create(
          PDFdoc,
          PDFNet.Font.StandardType1Font.e_helvetica
        ),
        fontSize
      );

      await writer.writeElement(element);

      element = await eb.createNewTextRun(annotContents);
      element.setTextMatrixEntries(1, 0, 0, 1, xPos, yPos);
      gstate = await element.getGState();
      await gstate.setFillColorSpace(colorspace);
      await gstate.setFillColorWithColorPt(color);

      await writer.writeElement(element);
      await writer.writeElement(await eb.createTextEnd());

      await writer.end();
    }

    // From here, save the document locally/to storage/etc or reload viewer with the updated doc
    documentViewer.loadDocument(PDFdoc);
  };

  return (
    <div className="App">
      <button onClick={transformFreeTextToPdfText}>Transform</button>
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
