export function ManifestoStatement() {
  return (
    <section className="w-full py-10 md:py-16 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        <div
          className="rounded-3xl py-20 md:py-[120px] px-6"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-[32px] md:text-[48px] font-light leading-[1.3] text-foreground">
              O ambiente onde você trabalha
              <br />
              não é decoração.
            </h2>

            <p className="mt-6 text-[32px] md:text-[48px] font-bold leading-[1.3] text-foreground">
              É infraestrutura pessoal.
            </p>

            <p className="mt-12 text-base md:text-[20px] font-normal leading-[1.6] text-muted-foreground">
              Cada objeto sobre a sua mesa comunica algo
              <br />
              — antes de você abrir a boca em qualquer call.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
