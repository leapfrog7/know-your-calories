import { useState } from "react";
import { getOpenFoodFactsProductByBarcode } from "./openFoodFactsApi";

function BarcodeLookup({ onProductFound }) {
  const [barcode, setBarcode] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const loading = status === "loading";

  async function handleLookup(event) {
    event.preventDefault();

    const cleanBarcode = barcode.trim().replace(/\D/g, "");

    if (!cleanBarcode) {
      setStatus("error");
      setMessage("Enter the barcode number printed on the packet.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      const product = await getOpenFoodFactsProductByBarcode(cleanBarcode);

      setStatus("success");
      setMessage("Product found.");
      onProductFound(product);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Could not find product.");
    }
  }

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-base font-black text-slate-950">
          Barcode lookup
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          Enter the barcode number printed on a packaged item.
        </p>
      </div>

      <form onSubmit={handleLookup} className="mt-4 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={barcode}
          onChange={(event) => setBarcode(event.target.value)}
          placeholder="e.g. 890..."
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-950 outline-none focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:bg-slate-300"
        >
          {loading ? "Finding" : "Find"}
        </button>
      </form>

      {message && (
        <p
          className={`mt-3 text-sm font-semibold ${
            status === "error" ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}

export default BarcodeLookup;