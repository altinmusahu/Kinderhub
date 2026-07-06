const EVENT_NAME = "kh:attendance-updated"

export function notifyAttendanceUpdated(classId: string) {
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { classId } }))
}

export function onAttendanceUpdated(classId: string, handler: () => void): () => void {
  function listener(e: Event) {
    const detail = (e as CustomEvent<{ classId: string }>).detail
    if (detail?.classId === classId) handler()
  }
  window.addEventListener(EVENT_NAME, listener)
  return () => window.removeEventListener(EVENT_NAME, listener)
}
