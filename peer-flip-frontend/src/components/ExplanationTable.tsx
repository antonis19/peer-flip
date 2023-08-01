import React, { useContext, useEffect, useState } from 'react';
import { CoinFlipState } from '../CoinFlipSession'; // Import the CoinFlipState interface
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CoinFlipStateContext } from '../contexts/CoinFlipStateContext';
import { doesCommitmentMatch } from '../flipUtils';



interface ExplanationTableProps {
    currentUser: string;
}

const StyledTableCell = styled(TableCell)({
    border: '1px solid black', // Add border style here
});

const BoldTableHeadCell = styled(TableCell)({
    fontWeight: 'bold',
    border: '1px solid black', // Add border style here
});

const ExplanationTable: React.FC<ExplanationTableProps> = ({ currentUser }) => {
    const coinFlipContext = useContext(CoinFlipStateContext);

    if (!coinFlipContext) {
        throw new Error("CoinFlipStateContext is undefined");
    }


    useEffect(() => {
        console.log("coinFlipState changed", coinFlipContext.coinFlipState);
    }, [coinFlipContext.coinFlipState]);



    if (!coinFlipContext.coinFlipState) {
        return <></>;
    }

    const { otherUsers, receivedCommitments, revealedValues, revealedNonces, v, nonce, commitment, commitmentMatch } = coinFlipContext.coinFlipState;

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <BoldTableHeadCell>User ID</BoldTableHeadCell>
                        <BoldTableHeadCell>Commitment [ sha256(User ID || Random Value || Nonce ) ]</BoldTableHeadCell>
                        <BoldTableHeadCell>Random Value</BoldTableHeadCell>
                        <BoldTableHeadCell>Nonce</BoldTableHeadCell>
                        <BoldTableHeadCell>Matching commitment</BoldTableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* Display current user's row */}
                    <TableRow>
                        <StyledTableCell>{currentUser}</StyledTableCell>
                        <StyledTableCell>{commitment}</StyledTableCell>
                        <StyledTableCell>{v}</StyledTableCell>
                        <StyledTableCell>{nonce}</StyledTableCell>
                        <StyledTableCell>{commitmentMatch.get(currentUser) ? "✅" : "❌"}</StyledTableCell>
                    </TableRow>
                    {/* Display rows for other users */}
                    {otherUsers.map((userId) => (
                        <TableRow key={userId}>
                            <StyledTableCell>{userId}</StyledTableCell>
                            <StyledTableCell>{receivedCommitments.get(userId)}</StyledTableCell>
                            <StyledTableCell>{revealedValues.get(userId)}</StyledTableCell>
                            <StyledTableCell>{revealedNonces.get(userId)}</StyledTableCell>
                            <StyledTableCell>{commitmentMatch.get(userId) ? "✅" : "❌"} </StyledTableCell>
                        </TableRow>
                    ))}
                </TableBody>

            </Table>
        </TableContainer>
    );
};

export default ExplanationTable;
