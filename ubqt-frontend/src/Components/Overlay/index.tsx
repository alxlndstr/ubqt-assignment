const Overlay = ({children, closeFunc}: OverlayProps ) => {
  const hideOverlay = (e: any) => {
    if (e.target?.id == 'Overlay') {
      closeFunc(false);
    }
  }
  return <div className="Overlay" id="Overlay" onClick={hideOverlay}>
    { children }
  </div>
}

export default Overlay;