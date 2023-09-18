import React from 'react';
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
            <Typography sx={{ margin: '10px' }}> The result is calculated as the XOR of all random values. If the result is 0 then the outcome is heads, otherwise tails. </Typography>
        </Accordion>
    );
};

export default ExplanationAccordion;
