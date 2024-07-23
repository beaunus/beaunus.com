import { Chip, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import Link from "next/link";
import * as React from "react";

import { Exercise } from "../../utils/exercise.types";

import exercisesJSON from "./exercises.json";

type Order = "asc" | "desc";

const exercises: (Exercise & { id: number })[] = exercisesJSON.map(
	(element, index) => ({ ...element, id: index })
);

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	return b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0;
}

function getComparator<Key extends keyof Exercise>(
	order: Order,
	orderBy: Key
): (
	a: { [key in Key]: string | string[] | number },
	b: { [key in Key]: string | string[] | number }
) => number {
	return order === "desc"
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(
	array: readonly T[],
	comparator: (a: T, b: T) => number
) {
	const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
	stabilizedThis.sort((a, b) => {
		const order = comparator(a[0], b[0]);
		return order || a[1] - b[1];
	});
	return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
	disablePadding: boolean;
	id: keyof Exercise;
	isNumeric?: boolean;
	label: string;
}

const headCells: readonly HeadCell[] = [
	{ disablePadding: true, id: "heading", label: "Exercise" },
	{ disablePadding: false, id: "equipmentType", label: "Equipment Type" },
	{ disablePadding: false, id: "musclesTargeted", label: "Muscles Targeted" },
	{ disablePadding: false, id: "rating", isNumeric: true, label: "Rating" },
];

interface EnhancedTableProps {
	onRequestSort: (
		event: React.MouseEvent<unknown>,
		property: keyof Exercise
	) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { order, orderBy, onRequestSort } = props;
	const createSortHandler =
		(property: keyof Exercise) => (event: React.MouseEvent<unknown>) => {
			onRequestSort(event, property);
		};

	return (
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
							onClick={createSortHandler(headCell.id)}
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
}

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
	new Set(exercises.flatMap((exercise) => exercise.equipmentType))
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
	const [order, setOrder] = React.useState<Order>("asc");
	const [orderBy, setOrderBy] = React.useState<keyof Exercise>("heading");
	const [page, setPage] = React.useState(0);
	const [isDense, setIsDense] = React.useState(false);
	const [rowsPerPage, setRowsPerPage] = React.useState(100);
	const [musclesTargetedToDisplay, setMusclesTargetedToDisplay] =
		React.useState<string[]>([]);
	const [equipmentTypesToDisplay, setEquipmentTypesToDisplay] = React.useState<
		string[]
	>([]);

	function EnhancedTableToolbar() {
		return (
			<Toolbar
				sx={{
					pl: { sm: 2 },
					pr: { sm: 1, xs: 1 },
				}}
			>
				<Typography
					component="div"
					id="tableTitle"
					sx={{ flex: "1 1 100%" }}
					variant="h6"
				>
					Exercises
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
									backgroundColor: equipmentTypesToDisplay.includes(
										equipmentType
									)
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
			</Toolbar>
		);
	}

	const handleRequestSort = (
		event: React.MouseEvent<unknown>,
		property: keyof Exercise
	) => {
		const isAsc = orderBy === property && order === "asc";
		setOrder(isAsc ? "desc" : "asc");
		setOrderBy(property);
	};

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIsDense(event.target.checked);
	};

	// Avoid a layout jump when reaching the last page with empty exercises.
	const emptyRows =
		page > 0 ? Math.max(0, (1 + page) * rowsPerPage - exercises.length) : 0;

	const visibleRows = React.useMemo(
		() =>
			stableSort(
				exercises.filter(
					(exercise) =>
						musclesTargetedToDisplay.includes(exercise.musclesTargeted) &&
						equipmentTypesToDisplay.includes(exercise.equipmentType)
				),
				getComparator(order, orderBy)
			).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[
			equipmentTypesToDisplay,
			musclesTargetedToDisplay,
			order,
			orderBy,
			page,
			rowsPerPage,
		]
	);

	return (
		<Box sx={{ width: "100%" }}>
			<Paper sx={{ mb: 2, width: "100%" }}>
				<EnhancedTableToolbar />
				<TableContainer>
					<Table
						aria-labelledby="tableTitle"
						size={isDense ? "small" : "medium"}
						stickyHeader
						sx={{ minWidth: 750 }}
					>
						<EnhancedTableHead
							onRequestSort={handleRequestSort}
							order={order}
							orderBy={orderBy}
							rowCount={exercises.length}
						/>
						<TableBody>
							{visibleRows.map((row, index) => {
								const labelId = `enhanced-table-checkbox-${index}`;

								return (
									<TableRow
										hover
										key={row.id}
										role="checkbox"
										sx={{ cursor: "pointer" }}
										tabIndex={-1}
									>
										<TableCell
											component="th"
											id={labelId}
											padding="none"
											scope="row"
										>
											<Link href={`https://www.bodybuilding.com${row.link}`}>
												{row.heading}
											</Link>
										</TableCell>
										<TableCell>
											<Chip
												label={row.equipmentType}
												style={{
													backgroundColor:
														colorByEquipmentType[row.equipmentType],
												}}
											/>
										</TableCell>
										<TableCell>
											<Chip
												label={row.musclesTargeted}
												style={{
													backgroundColor:
														colorByMusclesTargeted[row.musclesTargeted],
												}}
											/>
										</TableCell>
										<TableCell align="right">{row.rating}</TableCell>
									</TableRow>
								);
							})}
							{emptyRows > 0 && (
								<TableRow style={{ height: (isDense ? 33 : 53) * emptyRows }}>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					component="div"
					count={exercises.length}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					page={page}
					rowsPerPage={rowsPerPage}
					rowsPerPageOptions={[10, 100, 1000, 10000]}
				/>
			</Paper>
			<FormControlLabel
				control={<Switch checked={isDense} onChange={handleChangeDense} />}
				label="Dense padding"
			/>
		</Box>
	);
}
