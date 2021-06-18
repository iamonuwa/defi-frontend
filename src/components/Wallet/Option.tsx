import { FC } from 'react';
import { Box, makeStyles, Theme } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import grey from '@material-ui/core/colors/grey';

const useStyles = makeStyles((theme: Theme) => ({
	box: {
		padding: theme.spacing(1),
		cursor: 'pointer',
		border: `1px solid ${grey[400]}`,
		borderRadius: 5,
		margin: theme.spacing(1, 0)
	},
	flex: {
		display: 'flex',
		alignItems: 'center'
	},
	image: {
		width: 5,
		height: 5,
		marginRight: 2
	}
}));

type WalletOptionsProps = {
	onClick?: () => void;
	id: string;
	header: string;
	color?: string;
	subheader: string;
	link?: string;
	icon?: string;
};

export const WalletOptions: FC<WalletOptionsProps> = ({
	onClick,
	id,
	header,
	subheader
}) => {
	const { box, flex, image } = useStyles();
	return (
		<Box id={id} onClick={onClick} className={box}>
			<div className={flex}>
				<Typography variant="body1" gutterBottom>
					{header}
				</Typography>
			</div>
			{subheader && (
				<Typography variant="body2" gutterBottom>
					{subheader}
				</Typography>
			)}
		</Box>
	);
};
