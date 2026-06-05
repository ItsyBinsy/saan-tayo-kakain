export default function FilterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preload" as="image" href="/icons/all.png" />
      <link rel="preload" as="image" href="/icons/rice.png" />
      <link rel="preload" as="image" href="/icons/fastfood.png" />
      <link rel="preload" as="image" href="/icons/snack.png" />
      <link rel="preload" as="image" href="/icons/dessert.png" />
      <link rel="preload" as="image" href="/icons/drinks.png" />
      {children}
    </>
  )
}
