import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from "@mui/material";
import { isPriorityDistrict } from "../utils/priorityDistricts";
import PriorityChip from "./PriorityChip";

const DistrictTable = ({ data }) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 4,
        mt: 4,
      }}
    >
      <CardContent>

        <Typography
          variant="h6"
          fontWeight="bold"
          mb={2}
        >
          📋 District Performance Table
        </Typography>
        <TableContainer component={Paper}>

          <Table size="small">

            <TableHead>

              <TableRow
                sx={{
                  backgroundColor: "#1976d2",
                }}
              >

                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Rank
                </TableCell>

                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  District
                </TableCell>

                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  Foundational
                </TableCell>

                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  Preparatory
                </TableCell>

                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  Middle
                </TableCell>

                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>
                  Overall
                </TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {data.map((row) => (

                <TableRow
                  key={row.Rank}
                  hover
                  sx={
                    isPriorityDistrict(row.District)
                      ? { bgcolor: "#FFFBEB" }
                      : undefined
                  }
                >

                  <TableCell>{row.Rank}</TableCell>

                  <TableCell>
                    {row.District}
                    <PriorityChip district={row.District} />
                  </TableCell>

                  <TableCell align="center">
                    {row.Foundational}%
                  </TableCell>

                  <TableCell align="center">
                    {row.Preparatory}%
                  </TableCell>

                  <TableCell align="center">
                    {row.Middle}%
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {row.Overall}%
                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </TableContainer>

      </CardContent>

    </Card>
  );
};

export default DistrictTable;