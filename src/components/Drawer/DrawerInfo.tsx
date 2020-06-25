import * as React from 'react'
import { FunctionComponent, ReactElement } from 'react'

const DrawerInfo: FunctionComponent<{ infoItem: { component: ReactElement } }> = ({ infoItem }) => infoItem.component

export default React.memo(DrawerInfo)
