import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { residenceMediumStyle } from '@/components/shared/styleMedium';

type AddressSuggestionInputProps = {
      id?: string;
      label?: string;
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
};

const PROVINCES = [
      'An Giang',
      'Bà Rịa - Vũng Tàu',
      'Bạc Liêu',
      'Bắc Giang',
      'Bắc Kạn',
      'Bắc Ninh',
      'Bến Tre',
      'Bình Dương',
      'Bình Định',
      'Bình Phước',
      'Bình Thuận',
      'Cà Mau',
      'Cao Bằng',
      'Cần Thơ',
      'Đà Nẵng',
      'Đắk Lắk',
      'Đắk Nông',
      'Điện Biên',
      'Đồng Nai',
      'Đồng Tháp',
      'Gia Lai',
      'Hà Giang',
      'Hà Nam',
      'Hà Nội',
      'Hà Tĩnh',
      'Hải Dương',
      'Hải Phòng',
      'Hậu Giang',
      'Hòa Bình',
      'Hưng Yên',
      'Khánh Hòa',
      'Kiên Giang',
      'Kon Tum',
      'Lai Châu',
      'Lâm Đồng',
      'Lạng Sơn',
      'Lào Cai',
      'Long An',
      'Nam Định',
      'Nghệ An',
      'Ninh Bình',
      'Ninh Thuận',
      'Phú Thọ',
      'Phú Yên',
      'Quảng Bình',
      'Quảng Nam',
      'Quảng Ngãi',
      'Quảng Ninh',
      'Quảng Trị',
      'Sóc Trăng',
      'Sơn La',
      'Tây Ninh',
      'Thái Bình',
      'Thái Nguyên',
      'Thanh Hóa',
      'Thừa Thiên Huế',
      'Tiền Giang',
      'TP. Hồ Chí Minh',
      'Trà Vinh',
      'Tuyên Quang',
      'Vĩnh Long',
      'Vĩnh Phúc',
      'Yên Bái',
];

const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
      'TP. Hồ Chí Minh': [
            'Quận 1',
            'Quận 3',
            'Quận 4',
            'Quận 5',
            'Quận 6',
            'Quận 7',
            'Quận 8',
            'Quận 10',
            'Quận 11',
            'Quận 12',
            'Bình Tân',
            'Bình Thạnh',
            'Gò Vấp',
            'Phú Nhuận',
            'Tân Bình',
            'Tân Phú',
            'Thủ Đức',
            'Bình Chánh',
            'Cần Giờ',
            'Củ Chi',
            'Hóc Môn',
            'Nhà Bè',
      ],
      'Hà Nội': [
            'Ba Đình',
            'Hoàn Kiếm',
            'Tây Hồ',
            'Long Biên',
            'Cầu Giấy',
            'Đống Đa',
            'Hai Bà Trưng',
            'Hoàng Mai',
            'Thanh Xuân',
            'Hà Đông',
            'Nam Từ Liêm',
            'Bắc Từ Liêm',
            'Sơn Tây',
            'Ba Vì',
            'Chương Mỹ',
            'Đan Phượng',
            'Đông Anh',
            'Gia Lâm',
            'Hoài Đức',
            'Mê Linh',
            'Mỹ Đức',
            'Phú Xuyên',
            'Phúc Thọ',
            'Quốc Oai',
            'Sóc Sơn',
            'Thạch Thất',
            'Thanh Oai',
            'Thanh Trì',
            'Thường Tín',
            'Ứng Hòa',
      ],
      'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ', 'Hòa Vang'],
      'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn', 'Thốt Nốt', 'Phong Điền', 'Cờ Đỏ', 'Thới Lai', 'Vĩnh Thạnh'],
      'Thừa Thiên Huế': ['Huế', 'Hương Thủy', 'Hương Trà', 'A Lưới', 'Nam Đông', 'Phong Điền', 'Phú Lộc', 'Phú Vang', 'Quảng Điền'],
};

const COMMON_WARDS = [
      'Phường 1',
      'Phường 2',
      'Phường 3',
      'Phường 4',
      'Phường 5',
      'Phường 6',
      'Phường 7',
      'Phường 8',
      'Phường 9',
      'Phường 10',
      'Phường 11',
      'Phường 12',
      'Phường 13',
      'Phường 14',
      'Phường 15',
      'Xã Bình Hưng',
      'Xã Tân Kiên',
      'Xã Vĩnh Lộc A',
      'Xã Vĩnh Lộc B',
      'Thị trấn Nhà Bè',
      'Thị trấn Củ Chi',
      'Thị trấn Hóc Môn',
];

function splitAddress(value: string) {
      const parts = String(value || '')
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean);

      if (parts.length >= 4) {
            return {
                  detail: parts.slice(0, -3).join(', '),
                  ward: parts[parts.length - 3] || '',
                  district: parts[parts.length - 2] || '',
                  province: parts[parts.length - 1] || '',
            };
      }

      return {
            detail: value || '',
            ward: '',
            district: '',
            province: '',
      };
}

function buildAddressValue(input: {
      detail: string;
      ward: string;
      district: string;
      province: string;
}) {
      return [input.detail, input.ward, input.district, input.province]
            .map((part) => part.trim())
            .filter(Boolean)
            .join(', ');
}

export function AddressSuggestionInput({
      id,
      label = 'Địa chỉ',
      value,
      onChange,
      placeholder = 'Số nhà, đường, khu phố...',
}: AddressSuggestionInputProps) {
      const parsed = useMemo(() => splitAddress(value), []);
      const [detail, setDetail] = useState(parsed.detail);
      const [ward, setWard] = useState(parsed.ward);
      const [district, setDistrict] = useState(parsed.district);
      const [province, setProvince] = useState(parsed.province);

      const districtSuggestions = province ? DISTRICTS_BY_PROVINCE[province] || [] : [];

      useEffect(() => {
            onChange(buildAddressValue({ detail, ward, district, province }));
      }, [detail, ward, district, province, onChange]);

      return (
            <div>
                  <label htmlFor={id} className={residenceMediumStyle.fieldLabel}>
                        {label}
                  </label>

                  <div className="mt-1 grid gap-3 md:grid-cols-2">
                        <Input
                              id={id}
                              value={province}
                              onChange={(event) => setProvince(event.target.value)}
                              placeholder="Tỉnh / thành phố"
                              list={`${id || 'address'}-province-options`}
                              className={residenceMediumStyle.formInput}
                        />
                        <datalist id={`${id || 'address'}-province-options`}>
                              {PROVINCES.map((item) => (
                                    <option key={item} value={item} />
                              ))}
                        </datalist>

                        <Input
                              value={district}
                              onChange={(event) => setDistrict(event.target.value)}
                              placeholder="Quận / huyện / TP"
                              list={`${id || 'address'}-district-options`}
                              className={residenceMediumStyle.formInput}
                        />
                        <datalist id={`${id || 'address'}-district-options`}>
                              {districtSuggestions.map((item) => (
                                    <option key={item} value={item} />
                              ))}
                        </datalist>

                        <Input
                              value={ward}
                              onChange={(event) => setWard(event.target.value)}
                              placeholder="Phường / xã"
                              list={`${id || 'address'}-ward-options`}
                              className={residenceMediumStyle.formInput}
                        />
                        <datalist id={`${id || 'address'}-ward-options`}>
                              {COMMON_WARDS.map((item) => (
                                    <option key={item} value={item} />
                              ))}
                        </datalist>

                        <Textarea
                              value={detail}
                              onChange={(event) => setDetail(event.target.value)}
                              placeholder={placeholder}
                              className={residenceMediumStyle.formTextarea}
                        />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                        Có thể chọn gợi ý hoặc nhập tay. Dữ liệu vẫn lưu về một trường địa chỉ như hiện tại.
                  </p>
            </div>
      );
}

export default AddressSuggestionInput;
