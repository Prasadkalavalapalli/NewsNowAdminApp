import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {h, w} from '../../constants/dimensions';
import { pallette } from '../helpers/colors';
import { semibold,regular, medium, bold } from '../helpers/fonts';
import Icon from 'react-native-vector-icons/FontAwesome6';

const Header = ({
  active,
  onback,
  onSkip,
  hastitle,
  title,
  skippable = true,
  hasback = true,
}: {
  active: number;
  onback: (digit: number) => void;
  onSkip: () => void;
  hastitle?: boolean;
  title?: string;
  skippable?: boolean;
  hasback?: boolean;
}) => {
  return (
    <View style={styles.container}>
      {active != 0 ? (
        <View style={styles.row}>
          {hasback ? (
            <TouchableOpacity onPress={() => onback(active - 1)}>
              <Icon
                name={'arrow-left-long'}
                size={w * 0.05}
                color={pallette.black}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => onback()}>
            <Image
              source={require('../../Asserts/logo.jpeg')}
              style={styles.logo}
            />
            </TouchableOpacity>
          )}
          {hastitle && <Text style={styles.title}>{title}</Text>}
        </View>
      ) : (
        <View />
      )}
      {skippable &&
      (<TouchableOpacity onPress={() => onSkip()}>
          <Text>Skip</Text>
      </TouchableOpacity>)}
      
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: h * 0.05,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: w * 0.06,
   
  },
  row: {
    flexDirection: 'row',
    gap: w * 0.03,
    alignItems: 'center',
    //  flex:1,
  },
  title: {
    fontSize: 20,
    color: pallette.black,
    fontFamily: bold,
  },
  icon: {
    height: h * 0.03,
    width: h * 0.025,
    resizeMode: 'contain',
  },
  logo: {
    height: h * 0.03,
    width: h * 0.025,
    resizeMode: 'contain',
  },
});
