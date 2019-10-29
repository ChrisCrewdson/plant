import { convertPlantDataTypesForSaving } from '../../../../lib/db/mongo/converters';

describe('/lib/db/mongo/converters', () => {
  describe('convertPlantDataTypesForSaving', () => {
    test('should do basic conversion', () => {
      const plantIn: BizPlant = {
        _id: '5db7bc3796e0526dfa41c6e0',
        locationId: '5db7bc3796e0526dfa41c6e0',
        userId: '5db7bc3796e0526dfa41c6e0',
        title: 'Plant Title',
      };
      const result = convertPlantDataTypesForSaving(plantIn);
      expect(result).toMatchSnapshot();
    });

    test('should throw if no userId', () => {
      const plantIn = {
        _id: '5db7bc3796e0526dfa41c6e0',
        locationId: '5db7bc3796e0526dfa41c6e0',
        title: 'Plant Title',
      } as BizPlant;
      expect(() => convertPlantDataTypesForSaving(plantIn))
        .toThrowErrorMatchingSnapshot();
    });

    test('should throw if no locationId', () => {
      const plantIn = {
        _id: '5db7bc3796e0526dfa41c6e0',
        userId: '5db7bc3796e0526dfa41c6e0',
        title: 'Plant Title',
      } as BizPlant;
      expect(() => convertPlantDataTypesForSaving(plantIn))
        .toThrowErrorMatchingSnapshot();
    });

    test('should convert dates as well', () => {
      const plantIn: UiPlantsValue = {
        _id: '5db7bc3796e0526dfa41c6e0',
        locationId: '5db7bc3796e0526dfa41c6e0',
        userId: '5db7bc3796e0526dfa41c6e0',
        title: 'Plant Title',
        purchasedDate: '12/15/2019',
        terminatedDate: '02/29/2020',
        plantedDate: '01/01/2019',
      };
      const result = convertPlantDataTypesForSaving(plantIn);
      expect(result).toMatchSnapshot();
    });
  });
});
