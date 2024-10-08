import { Chip, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import Link from "next/link";
import * as React from "react";

import bodybuildingDotComJSON from "../../utils/exercise/bodybuilding-dot-com.json";
import { Exercise } from "../../utils/exercise/exercise.types";

type Order = "asc" | "desc";

const exercises: (Exercise & { id: number })[] = bodybuildingDotComJSON.map(
	(element, index) => ({ ...element, id: index })
);

const descendingComparator = <T,>(a: T, b: T, orderBy: keyof T) =>
	b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;

interface HeadCell {
	disablePadding: boolean;
	id: keyof Exercise;
	isNumeric?: boolean;
	label: string;
}

const headCells: readonly HeadCell[] = [
	{ disablePadding: true, id: "name", label: "Exercise" },
	{ disablePadding: false, id: "equipmentTypes", label: "Equipment Types" },
	{ disablePadding: false, id: "musclesTargeted", label: "Muscles Targeted" },
	{ disablePadding: false, id: "rating", isNumeric: true, label: "Rating" },
];

const EnhancedTableHead = ({
	onRequestSort,
	order,
	orderBy,
}: {
	onRequestSort: (sortKey: keyof Exercise) => void;
	order: Order;
	orderBy: string;
}) => (
	<TableHead>
		<TableRow>
			{headCells.map((headCell) => (
				<TableCell
					align={headCell.isNumeric ? "right" : "left"}
					key={headCell.id}
					padding={headCell.disablePadding ? "none" : "normal"}
					sortDirection={orderBy === headCell.id ? order : false}
				>
					<TableSortLabel
						active={orderBy === headCell.id}
						direction={orderBy === headCell.id ? order : "asc"}
						onClick={() => onRequestSort(headCell.id)}
					>
						{headCell.label}
						{orderBy === headCell.id ? (
							<Box component="span" sx={visuallyHidden}>
								{order === "desc" ? "sorted descending" : "sorted ascending"}
							</Box>
						) : null}
					</TableSortLabel>
				</TableCell>
			))}
		</TableRow>
	</TableHead>
);

const uniqueMusclesTargeted = Array.from(
	new Set(exercises.flatMap((exercise) => exercise.musclesTargeted))
).sort();

const colorByMusclesTargeted = Object.fromEntries(
	uniqueMusclesTargeted.map((musclesTargeted, index, array) => [
		musclesTargeted,
		`hsl(${Math.floor((256 * index) / array.length)}, 100%, ${
			index % 2 === 0 ? "75%" : "90%"
		})`,
	])
);

const uniqueEquipmentTypes = Array.from(
	new Set(exercises.flatMap((exercise) => exercise.equipmentTypes))
).sort();

const colorByEquipmentType = Object.fromEntries(
	uniqueEquipmentTypes.map((equipmentType, index, array) => [
		equipmentType,
		`hsl(${Math.floor((256 * index) / array.length)}, 100%, ${
			index % 2 === 0 ? "75%" : "90%"
		})`,
	])
);

export default function EnhancedTable() {
	const [equipmentTypesToDisplay, setEquipmentTypesToDisplay] = React.useState<
		string[]
	>([]);
	const [musclesTargetedToDisplay, setMusclesTargetedToDisplay] =
		React.useState<string[]>([]);
	const [order, setOrder] = React.useState<Order>("asc");
	const [orderBy, setOrderBy] = React.useState<keyof Exercise>("name");
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(100);

	const EnhancedTableToolbar: React.FC = () => (
		<Stack direction="row">
			<Typography
				component="div"
				display="flex"
				flexDirection="column"
				gap={2}
				sx={{ flex: "1 1 100%" }}
				variant="h6"
			>
				<Stack direction="row" gap={2}>
					Equipment Types
					<Chip
						label="check none"
						onClick={() => setEquipmentTypesToDisplay([])}
					/>
					<Chip
						label="check all"
						onClick={() => setEquipmentTypesToDisplay(uniqueEquipmentTypes)}
					/>
				</Stack>
				<Box display="flex" flexWrap="wrap" gap={2}>
					{uniqueEquipmentTypes.map((equipmentType, index) => (
						<Chip
							key={`equipmentType-${index}`}
							label={equipmentType}
							onClick={() => {
								setEquipmentTypesToDisplay((old) =>
									old.includes(equipmentType)
										? old
												.slice(0, old.indexOf(equipmentType))
												.concat(old.slice(old.indexOf(equipmentType) + 1))
										: old.concat([equipmentType])
								);
							}}
							style={{
								backgroundColor: equipmentTypesToDisplay.includes(equipmentType)
									? colorByEquipmentType[equipmentType]
									: "#eee",
							}}
						/>
					))}
				</Box>
			</Typography>
			<Typography
				component="div"
				display="flex"
				flexDirection="column"
				gap={2}
				sx={{ flex: "1 1 100%" }}
				variant="h6"
			>
				<Stack direction="row" gap={2}>
					Muscles Targeted
					<Chip
						label="check none"
						onClick={() => setMusclesTargetedToDisplay([])}
					/>
					<Chip
						label="check all"
						onClick={() => setMusclesTargetedToDisplay(uniqueMusclesTargeted)}
					/>
				</Stack>
				<Box display="flex" flexWrap="wrap" gap={2}>
					{uniqueMusclesTargeted.map((musclesTargeted, index) => (
						<Chip
							key={`musclesTargeted-${index}`}
							label={musclesTargeted}
							onClick={() => {
								setMusclesTargetedToDisplay((old) =>
									old.includes(musclesTargeted)
										? old
												.slice(0, old.indexOf(musclesTargeted))
												.concat(old.slice(old.indexOf(musclesTargeted) + 1))
										: old.concat([musclesTargeted])
								);
							}}
							style={{
								backgroundColor: musclesTargetedToDisplay.includes(
									musclesTargeted
								)
									? colorByMusclesTargeted[musclesTargeted]
									: "#eee",
							}}
						/>
					))}
				</Box>
			</Typography>
		</Stack>
	);

	// Avoid a layout jump when reaching the last page with empty exercises.
	const numEmptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - exercises.length) : 0;

	const visibleRows = React.useMemo(() => {
		const shouldShowExercise = ({
			equipmentTypes,
			musclesTargeted,
		}: Exercise) =>
			musclesTargetedToDisplay.some((muscleTargeted) =>
				musclesTargeted.includes(muscleTargeted)
			) &&
			equipmentTypesToDisplay.some((equipmentType) =>
				equipmentTypes.includes(equipmentType)
			);

		return exercises
			.filter(shouldShowExercise)
			.slice()
			.sort((a, b) =>
				order === "desc"
					? descendingComparator(a, b, orderBy)
					: -descendingComparator(a, b, orderBy)
			)
			.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
	}, [
		equipmentTypesToDisplay,
		musclesTargetedToDisplay,
		order,
		orderBy,
		page,
		rowsPerPage,
	]);

	return (
		<Box sx={{ width: "100%" }}>
			<Paper sx={{ mb: 2, width: "100%" }}>
				<EnhancedTableToolbar />
				<TableContainer>
					<Table
						aria-labelledby="tableTitle"
						size="small"
						stickyHeader
						sx={{ minWidth: 750 }}
					>
						<EnhancedTableHead
							onRequestSort={(sortKey: keyof Exercise) => {
								const isAsc = orderBy === sortKey && order === "asc";
								setOrder(isAsc ? "desc" : "asc");
								setOrderBy(sortKey);
							}}
							order={order}
							orderBy={orderBy}
						/>
						<TableBody>
							{visibleRows.map((row, index) => (
								<TableRow
									hover
									key={row.id}
									role="checkbox"
									sx={{ cursor: "pointer" }}
									tabIndex={-1}
								>
									<TableCell
										component="th"
										id={`enhanced-table-checkbox-${index}`}
										padding="none"
										scope="row"
									>
										<Link href={`https://www.bodybuilding.com${row.link}`}>
											{row.name}
										</Link>
									</TableCell>
									<TableCell>
										<Chip
											label={row.equipmentTypes}
											style={{
												backgroundColor:
													colorByEquipmentType[row.equipmentTypes[0]],
											}}
										/>
									</TableCell>
									<TableCell>
										<Chip
											label={row.musclesTargeted}
											style={{
												backgroundColor:
													colorByMusclesTargeted[row.musclesTargeted[0]],
											}}
										/>
									</TableCell>
									<TableCell align="right">{row.rating}</TableCell>
								</TableRow>
							))}
							{numEmptyRows > 0 && (
								<TableRow style={{ height: 33 * numEmptyRows }}>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					component="div"
					count={exercises.length}
					onPageChange={(_event, newPage) => {
						setPage(newPage);
					}}
					onRowsPerPageChange={({ target }) => {
						setRowsPerPage(parseInt(target.value, 10));
						setPage(0);
					}}
					page={page}
					rowsPerPage={rowsPerPage}
					rowsPerPageOptions={[10, 100, 1000, 10000]}
				/>
			</Paper>
		</Box>
	);
}
