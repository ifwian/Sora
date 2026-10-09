/**
 * PhotoStrip — small thumbnails for a list of image URLs. Broken links are
 * hidden rather than showing a broken-image icon, and referrer info isn't sent.
 */
export function PhotoStrip({ photos, label }) {
  if (!photos?.length) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {photos.map((url) => (
        <a key={url} href={url} target="_blank" rel="noreferrer noopener" className="block">
          <img
            src={url}
            alt={label ? `Photo for ${label}` : 'Photo'}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.parentElement.style.display = 'none'
            }}
            className="h-16 w-16 object-cover rounded-sm border border-border"
          />
        </a>
      ))}
    </div>
  )
}
