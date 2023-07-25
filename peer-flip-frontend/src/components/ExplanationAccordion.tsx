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
                <ExplanationTable currentUser={currentUser} />
            </AccordionDetails>
        </Accordion>
    );
};

export default ExplanationAccordion;
