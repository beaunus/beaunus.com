/* eslint-disable jest/require-hook */
import https from "https";
import fs from "node:fs";
import path from "path";

import { parse } from "node-html-parser";

import { Exercise } from "../utils/exercise/exercise.types";

function fetchBatch(batchNumber = 1): Promise<Exercise[]> {
	return new Promise<string>((resolve, reject) => {
		https
			.get(
				`https://www.bodybuilding.com/exercises/finder/${batchNumber}`,
				(resp) => {
					let data = "";
					resp.on("data", (chunk) => (data += chunk));
					resp.on("end", () => resolve(data));
				}
			)
			.on("error", (err) => reject(err));
	})
		.then((html) => parse(html))
		.then((dom) =>
			dom.querySelectorAll(".ExResult-row").map((row) => ({
				equipmentType: row
					.querySelectorAll(".ExResult-equipmentType a")
					.map((element) => element.textContent.trim())
					.join(""),
				heading:
					row.querySelector(".ExResult-resultsHeading")?.textContent.trim() ??
					"",
				images: row
					.querySelectorAll("img.ExResult-img")
					.map((element) => element?.attributes?.src ?? ""),
				link:
					row.querySelector(".ExResult-resultsHeading a")?.attributes?.href ??
					"",
				musclesTargeted: row
					.querySelectorAll(".ExResult-muscleTargeted a")
					.map((element) => element.textContent.trim())
					.join(""),
				rating: parseFloat(
					row.querySelector(".ExRating-badge")?.textContent.trim() ?? ""
				),
			}))
		);
}

async function fetchExercises() {
	const BATCH_SIZE = 10;

	const exercises: Exercise[] = [];

	let isMore = true;
	for (let i = 0; isMore; ++i) {
		console.log(`Fetching batch ${i}`);
		const batch = await Promise.all(
			Array.from({ length: BATCH_SIZE }).map((_value, index) =>
				fetchBatch(BATCH_SIZE * i + index + 1)
			)
		);

		exercises.push(...batch.flat());
		isMore = batch.some((element) => element.length);
	}
	return exercises;
}

fetchExercises().then((exercises) => {
	try {
		const filePath = path.join(
			__dirname,
			"..",
			"pages",
			"exercise",
			"exercises.json"
		);
		fs.writeFileSync(filePath, JSON.stringify(exercises));
	} catch (err) {
		console.error(err);
	}
});
