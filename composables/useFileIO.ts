export function useFileIO() {
  function downloadTxt(filename: string, content: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  function readUploadedFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target!.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  return { downloadTxt, readUploadedFile }
}
