import { Component, type ReactNode } from 'react'
import { Modal } from './Modal'

export class SimulatorBoundary extends Component<{ children: ReactNode; onClose: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <Modal label="Simulator could not load" className="farm-loading" onClose={this.props.onClose}>
      <section className="recovery-panel" role="alert">
        <h2>Couldn’t open Cozy Farm</h2>
        <p>Check your connection and reload to try again.</p>
        <button onClick={() => window.location.reload()}>Reload simulator</button>
        <button onClick={this.props.onClose}>Back to calculator</button>
      </section>
    </Modal>
  }
}
