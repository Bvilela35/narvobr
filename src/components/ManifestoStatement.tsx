export function ManifestoStatement() {
  return (
    <section className="w-full px-3 md:px-6">
      <div className="w-full rounded-b-3xl py-10 md:py-14 px-6 md:px-10" style={{ backgroundColor: "#f0f0f0" }}>
        <div className="max-w-[800px] mx-auto text-center">
          <p className="text-[32px] md:text-[48px] font-bold leading-[1.3] text-foreground">
            É infraestrutura pessoal.
          </p>

          <p className="mt-8 text-base md:text-[20px] font-normal leading-[1.6] text-muted-foreground">
            Cada objeto sobre a sua mesa comunica algo
            <br />
            — antes de você abrir a boca em qualquer call.
          </p>
        </div>
      </div>
    </section>
  );
}
