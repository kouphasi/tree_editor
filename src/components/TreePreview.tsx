export function TreePreview(props: { text: string }) {
  return (
    <section class="pane">
      <h2>Tree Preview</h2>
      <pre>{props.text}</pre>
    </section>
  )
}
