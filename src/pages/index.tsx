import { Theme, makeStyles, Paper } from '@material-ui/core';
import { useWeb3React } from '@web3-react/core';
import { TransferForm } from 'components/Transfer';
import { useAppDispatch, useAppSelector } from 'hooks/useRedux';
import { useEffect } from 'react';
import { fetchAppConfig } from 'store/reducers/app';
import { fetchBalances, selectBalances } from 'store/reducers/balances';

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		height: '90vh'
	}
}));

export default function Index() {
	const { account, library, chainId } = useWeb3React();
	const dispatch = useAppDispatch();
	const { data, loading } = useAppSelector(selectBalances);

	useEffect(() => {
		if (account) {
			// @ts-ignore
			dispatch(fetchAppConfig({ chainId }));
			// @ts-ignore
			dispatch(fetchBalances({ address: account, library }));
		}
	}, [account, dispatch, library, chainId]);
	const { root } = useStyles();
	return (
		<div className={root}>
			<TransferForm balances={data} />
		</div>
	);
}
