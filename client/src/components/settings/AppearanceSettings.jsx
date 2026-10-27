import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { OptionGroup } from './OptionGroup'
import { useTheme } from '../../hooks/useTheme'
import { DEFAULT_APPEARANCE, MODES, PALETTES, RADII, TEXT_SIZES } from '../../constants/appearance'
import { cn } from '../../utils/cn'

const MODE_ICONS = { light: Sun, dark: Moon, system: Monitor }

function Section({ title, description, children }) {
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted mt-1">{description}</p>}
      </div>
      {children}
    </Card>
  )
}

/**
 * A miniature of the real UI drawn in a palette's own colours. The element carries `data-palette`
 * (and `.dark` when the app is dark) so the real CSS variables apply — no colours are duplicated here.
 */
function PalettePreview({ paletteId, dark }) {
  return (
    <span
      aria-hidden="true"
      data-palette={paletteId}
      className={cn('block rounded-sm border border-border bg-background p-2', dark && 'dark')}
    >
      <span className="block rounded-sm border border-border bg-surface p-2">
        <span className="block h-1.5 w-2/3 rounded-full bg-foreground/80" />
        <span className="block h-1.5 w-1/2 rounded-full bg-muted/60 mt-1.5" />
        <span className="mt-2 flex items-center gap-1.5">
          <span className="h-4 w-9 rounded-sm bg-accent" />
          <span className="h-4 w-4 rounded-sm bg-surface-hover border border-border" />
        </span>
      </span>
    </span>
  )
}

function ShapePreview({ px }) {
  return (
    <span
      aria-hidden="true"
      className="flex items-center justify-center gap-2 rounded-sm bg-background border border-border py-3"
    >
      <span className="h-6 w-10 bg-accent" style={{ borderRadius: px[0] }} />
      <span className="h-6 w-6 border-2 border-control bg-surface" style={{ borderRadius: px[1] }} />
    </span>
  )
}

function TextPreview({ px }) {
  return (
    <span
      aria-hidden="true"
      className="flex items-center justify-center rounded-sm bg-background border border-border py-2 text-foreground"
      style={{ fontSize: px }}
    >
      Aa
    </span>
  )
}

/** Settings → Appearance. Every change applies instantly across the whole app and is saved to your account. */
export function AppearanceSettings() {
  const { appearance, resolvedTheme, setAppearance, resetAppearance } = useTheme()
  const isDefault = Object.keys(DEFAULT_APPEARANCE).every((key) => appearance[key] === DEFAULT_APPEARANCE[key])

  const modeOptions = MODES.map((mode) => ({ ...mode, blurb: mode.id === 'system' ? 'Match your device' : undefined }))

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Section title="Mode" description="Light, dark, or follow your device.">
        <OptionGroup
          label="Colour mode"
          options={modeOptions}
          value={appearance.mode}
          onChange={(mode) => setAppearance({ mode })}
          renderPreview={(option) => {
            const Icon = MODE_ICONS[option.id]
            return (
              <span
                aria-hidden="true"
                className="flex items-center justify-center rounded-sm bg-surface-hover py-3 text-foreground"
              >
                <Icon size={20} />
              </span>
            )
          }}
        />
      </Section>

      <Section
        title="Palette"
        description="Pick the colours you'd like to live in. Each one has a light and a dark version."
      >
        <OptionGroup
          label="Colour palette"
          options={PALETTES}
          value={appearance.palette}
          onChange={(palette) => setAppearance({ palette })}
          columns="grid-cols-2 sm:grid-cols-3"
          renderPreview={(option) => <PalettePreview paletteId={option.id} dark={resolvedTheme === 'dark'} />}
        />
      </Section>

      <Section title="Shape" description="How round the corners are.">
        <OptionGroup
          label="Corner shape"
          options={RADII}
          value={appearance.radius}
          onChange={(radius) => setAppearance({ radius })}
          renderPreview={(option) => <ShapePreview px={option.px} />}
        />
      </Section>

      <Section title="Text size" description="Scales the whole interface.">
        <OptionGroup
          label="Text size"
          options={TEXT_SIZES}
          value={appearance.textSize}
          onChange={(textSize) => setAppearance({ textSize })}
          renderPreview={(option) => <TextPreview px={option.px} />}
        />
      </Section>

      <div>
        <Button variant="ghost" size="sm" onClick={resetAppearance} disabled={isDefault}>
          <RotateCcw size={14} />
          Reset to defaults
        </Button>
      </div>
    </div>
  )
}
