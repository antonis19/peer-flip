import React, { useContext } from 'react';
import { CoinFlipStateContext } from '../contexts/CoinFlipStateContext';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExplanationTable from './ExplanationTable';

interface ExplanationAccordionProps {
    currentUser: string;
}

const ExplanationAccordion: React.FC<ExplanationAccordionProps> = ({ currentUser }) => {
    return (
        <Accordion sx={{
            backgroundColor: 'teal',
            color: 'white',
            width: '100%', // Set width to 100%
        }}>
            <AccordionSummary
                sx={{
                    color: 'white',
                    fontWeight: 'bold',
                }}
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} // Make the arrow icon white
            >
                <Typography sx={{ fontWeight: 'bold' }}>Explanation</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <ExplanationTable currentUser={currentUser} />
                </div>
            </AccordionDetails>
        </Accordion>
    );
};

export default ExplanationAccordion;
