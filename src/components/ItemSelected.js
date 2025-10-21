import { StyleSheet } from "react-native";
import { List } from 'react-native-paper';

export default function ItemSelected({ index, name, action, isSelected = false, icon }) {
  return (
    <List.Item
      key={index}
      title={name}
      left={props => <List.Icon {...props} icon={icon} />}
      onPress={action}
      style={[styles.item, isSelected && styles.itemSelected]}
      titleStyle={styles.title}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderColor: 'transparent',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  itemSelected: {
    borderColor: "#1f87d0ff",
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
});