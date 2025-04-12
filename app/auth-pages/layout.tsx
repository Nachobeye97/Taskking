export const metadata = {
  title: 'Mi App de Tareas',
  description: 'App estilo Trello para gestionar tareas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-12">
          {children}
        </div>
      </body>
    </html>
  )
}
