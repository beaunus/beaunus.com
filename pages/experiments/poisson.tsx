import Chart from "chart.js/auto";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";

const Poisson: NextPage = () => {
  const samplesChartRef = React.useRef<HTMLCanvasElement>(null);
  const barChartRef = React.useRef<HTMLCanvasElement>(null);

  const [countByGapSize, setCountByGapSize] = React.useState<
    Record<number, number>
  >({});
  const [i, setI] = React.useState(1);
  const [mostRecentTrueIndex, setMostRecentTrueIndex] = React.useState(0);
  const [samples, setSamples] = React.useState(
    Array.from({ length: 100 }, () => false)
  );

  function performTrial() {
    setI((old) => old + 1);
    const didEventHappen = Math.random() < 0.05;
    if (didEventHappen) {
      const thisGap = i - mostRecentTrueIndex;
      setCountByGapSize((old) => ({
        ...old,
        [thisGap]: (old[thisGap] ?? 0) + 1,
      }));
      setMostRecentTrueIndex(i);
    }
    setSamples((old) => old.slice(1).concat(didEventHappen));
  }

  React.useEffect(() => {
    const interval = setInterval(performTrial, 1);

    return () => clearInterval(interval);
  });

  React.useEffect(() => {
    if (samplesChartRef.current && barChartRef.current) {
      const samplesChart = new Chart(samplesChartRef.current, {
        data: {
          datasets: [{ data: samples.map(Number) }],
          labels: samples.map(() => ""),
        },
        options: {
          animation: { duration: 0 },
          plugins: { legend: { display: false } },
          scales: { y: { title: { display: true } } },
        },
        type: "bar",
      });

      const barChart = new Chart(barChartRef.current, {
        data: {
          datasets: [{ data: Object.values(countByGapSize) }],
          labels: Object.keys(countByGapSize),
        },
        options: {
          animation: { duration: 0 },
          plugins: { legend: { display: false } },
          scales: { y: { title: { display: true } } },
        },
        type: "bar",
      });

      return () => {
        samplesChart.destroy();
        barChart.destroy();
      };
    }
  }, [samples]);

  return (
    <>
      <Head>
        <title>Poisson | Beaunus</title>
      </Head>
      <div className="flex flex-col grow gap-2 text-center">
        <div className="flex flex-col gap-5 px-3">Poisson</div>
        <div className="w-full">
          <canvas ref={samplesChartRef}></canvas>
          <canvas ref={barChartRef}></canvas>
        </div>
      </div>
    </>
  );
};

export default Poisson;
