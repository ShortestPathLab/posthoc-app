import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

//TODO: implement menu for adding nodes
export default function NodeMenu() {
    return (
    <Fab color="primary" aria-label="add">
    <AddIcon />
    </Fab>
    );
}