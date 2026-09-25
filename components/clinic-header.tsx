export function ClinicHeader() {
  return (
    <div className="flex items-center gap-4 border-b-2 border-brand pb-2">
      <img
        src="/logo-renteria.png"
        alt="Oive · Dr. Julián Rentería, Audiólogo"
        className="h-16 w-auto shrink-0"
      />
      <div className="flex-1 text-center text-navy">
        <div className="text-[17px] font-extrabold tracking-wide">
          ESPECIALISTA EN VÉRTIGO Y PÉRDIDA AUDITIVA
        </div>
        <div className="text-xs text-[#3a4358] dark:text-muted-foreground">
          Cra. 30 # 32-29, B/ Centro — Frente al Banco de la Mujer
        </div>
        <div className="text-xs text-[#3a4358] dark:text-muted-foreground">
          Cel. 316 704 5684
        </div>
      </div>
    </div>
  )
}
