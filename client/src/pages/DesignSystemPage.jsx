import { useState } from 'react'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Textarea } from '../components/common/Textarea'
import { Badge } from '../components/common/Badge'
import { Modal } from '../components/common/Modal'
import { ThemeToggle } from '../components/common/ThemeToggle'
import { useToast } from '../hooks/useToast'

export function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { showToast } = useToast()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Milestone 02</p>
            <h1 className="text-2xl font-semibold tracking-tight">Design system</h1>
          </div>
          <ThemeToggle />
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Typography</h2>
          <Card className="flex flex-col gap-3">
            <p className="text-2xl font-semibold">Page title — 2xl semibold</p>
            <p className="text-lg font-semibold">Section heading — lg semibold</p>
            <p className="text-base font-semibold">Card title — base semibold</p>
            <p className="text-sm">Body text — sm regular</p>
            <p className="text-sm text-muted">Secondary text — sm muted</p>
            <p className="text-xs text-muted">Metadata / labels — xs muted</p>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Buttons</h2>
          <Card className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Badges</h2>
          <Card className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Inputs</h2>
          <Card className="flex flex-col gap-4 max-w-sm">
            <Input label="Task name" placeholder="Finish SQL assignment" />
            <Input
              label="Due date"
              type="date"
              helperText="Optional — leave blank for no due date"
            />
            <Input label="Email" error="This field is required" />
            <Textarea label="Notes" placeholder="Add any extra detail..." />
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Cards</h2>
          <Card>
            <Card.Header>
              <Card.Title>Database Management</Card.Title>
              <Card.Description>Assignment due in 3 days</Card.Description>
            </Card.Header>
            <p className="text-sm text-muted">
              Cards are separated by a hairline border, not a shadow — kept flat and calm.
            </p>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Modal &amp; toast</h2>
          <Card className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
            <Button variant="secondary" onClick={() => showToast({ message: 'Task completed.', variant: 'success' })}>
              Success toast
            </Button>
            <Button variant="secondary" onClick={() => showToast({ message: 'Could not save changes.', variant: 'error' })}>
              Error toast
            </Button>
            <Button variant="secondary" onClick={() => showToast({ message: 'Exam is in 2 days.', variant: 'warning' })}>
              Warning toast
            </Button>
          </Card>
        </section>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete task?"
        description="This action can't be undone."
      >
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setModalOpen(false)
              showToast({ message: 'Task deleted.', variant: 'info' })
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}


