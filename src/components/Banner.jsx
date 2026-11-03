// Page heading on top of a photo
function Banner({ image, title }) {
  return (
    <div className="banner" style={{ backgroundImage: `url(/images/${image})` }}>
      <h1>{title}</h1>
    </div>
  )
}

export default Banner
