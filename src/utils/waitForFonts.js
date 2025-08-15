export async function waitForFonts(fonts = []) {
  if (document.fonts) {
    const fontPromises = [];
    if (document.fonts.ready) {
      fontPromises.push(document.fonts.ready.catch(() => {}));
    }
    if (document.fonts.load) {
      fonts.forEach((font) => {
        try {
          fontPromises.push(document.fonts.load(font));
        } catch (e) {
          console.warn('Font load failed', font, e);
        }
      });
    }
    try {
      await Promise.all(fontPromises);
    } catch (err) {
      console.warn('Error waiting for fonts:', err);
    }
  }
}