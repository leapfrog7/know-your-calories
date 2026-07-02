import { useEffect, useState } from "react";
import { searchOpenFoodFacts } from "./openFoodFactsApi";
import FoodResultCard from "./FoodResultCard";

const MIN_OFF_SEARCH_LENGTH = 3;

function OpenFoodFactsSearch({ query, onSelectFood }) {
  const cleanQuery = query.trim();

  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (cleanQuery.length < MIN_OFF_SEARCH_LENGTH) {
      setStatus("idle");
      setResults([]);
      setMessage("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setStatus("loading");
        setMessage("");

        const foods = await searchOpenFoodFacts(cleanQuery, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setResults(foods);
        setStatus("success");

        if (!foods.length) {
          setMessage("No usable packaged food found in Open Food Facts.");
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        setResults([]);
        setStatus("error");
        setMessage(error.message || "Could not search Open Food Facts.");
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [cleanQuery]);

  if (cleanQuery.length < MIN_OFF_SEARCH_LENGTH) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-5 text-center">
        <p className="font-black text-slate-800">Search packaged foods online</p>
        <p className="mt-1 text-sm text-slate-500">
          Type at least 3 letters to search Open Food Facts.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-slate-400">
            Open Food Facts results
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">
            Online packaged food database
          </p>
        </div>

        {status === "loading" && (
          <p className="text-xs font-black text-emerald-700">Searching...</p>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((food) => (
            <FoodResultCard
              key={food.id}
              food={food}
              onSelect={onSelectFood}
            />
          ))}
        </div>
      )}

      {message && (
        <div
          className={`rounded-[1.75rem] border border-dashed bg-white p-5 text-center ${
            status === "error" ? "border-red-200" : "border-slate-300"
          }`}
        >
          <p
            className={`font-black ${
              status === "error" ? "text-red-700" : "text-slate-800"
            }`}
          >
            {status === "error" ? "Search failed" : "No result"}
          </p>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      )}
    </section>
  );
}

export default OpenFoodFactsSearch;