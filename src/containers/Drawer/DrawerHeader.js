import drawerActions from '../../store/drawer/actions'
import { DrawerHeader } from '../../components/Drawer'
import { connect } from 'react-redux'
import { setDialogIsOpen } from '../../store/dialogs/actions'

DrawerHeader.propTypes = {}

const mapStateToProps = state => {
  const { locale, dialogs, drawer } = state

  return {
    locale,
    dialogs,
    drawer
  }
}

export default connect(
  mapStateToProps,
  { setDialogIsOpen, ...drawerActions }
)(DrawerHeader)
