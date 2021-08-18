import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Select from "antd/lib/select";
import DatePicker from "antd/lib/date-picker";
import Input from "antd/lib/input";
import dayjs from "dayjs";
import { VideoMeta } from "../types/types";
import {
  filteredListState,
  dateRangeState,
  sortState,
  searchState,
  tagsState,
} from "../store";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Stack,
} from "@chakra-ui/react";
const { Option } = Select;
const { RangePicker } = DatePicker;

const tagCategories = [
  "Live",
  "VPICK",
  "ENOZI",
  "Promotion",
  "MV",
  "Cheer Guide",
  "Making Film",
  "LieV",
  "Star Road",
  "Idol Room",
  "Greetings",
  "Dance Practice",
  "Audio Only",
  "Misc",
];

const combineFilters = (
  data: VideoMeta[],
  dateRange: any,
  sort: string,
  search: string,
  tags: string[]
) => {
  let tagFilteredListData: VideoMeta[];
  let dateFilteredListData: VideoMeta[];
  let searchFilteredListData: VideoMeta[];
  let sortFilteredListData: VideoMeta[];

  // tags
  if (tags.length !== 0) {
    // satisfied when VideoMeta item tags includes any user filtered tags (OR)
    tagFilteredListData = data.filter((item) =>
      tags.some((e) => item.tags.includes(e))
    );
  } else {
    tagFilteredListData = data;
  }

  // date
  if (dateRange !== null) {
    dateFilteredListData = tagFilteredListData.filter((item) => {
      if (
        dayjs
          .utc(item.date)
          .local()
          .isBetween(dateRange[0], dateRange[1], "day", "[]")
      ) {
        return true;
      }
    });
  } else {
    dateFilteredListData = tagFilteredListData;
  }

  // search
  if (search !== "") {
    searchFilteredListData = dateFilteredListData.filter((item) =>
      item.title.toLowerCase().includes(search)
    );
  } else {
    searchFilteredListData = dateFilteredListData;
  }

  // sort
  if (sort === "asc") {
    sortFilteredListData = searchFilteredListData.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );
  } else {
    sortFilteredListData = searchFilteredListData.sort(
      (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
    );
  }

  return sortFilteredListData;
};

interface FilterDataProps {
  filterButtonRef: React.RefObject<HTMLButtonElement>;
  isOpen: boolean;
  onClose: () => void;
}

const FilterData: React.FC<FilterDataProps> = ({
  filterButtonRef,
  isOpen,
  onClose,
}) => {
  const { totalResults } = useRecoilValue(filteredListState);
  const [dateRange, setDateRange] = useRecoilState(dateRangeState);
  const [sort, setSort] = useRecoilState(sortState);
  const [tags, setTags] = useRecoilState(tagsState);
  const [search, setSearch] = useRecoilState(searchState);
  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      finalFocusRef={filterButtonRef}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{`Videos found: ${totalResults}`}</DrawerHeader>
        <DrawerBody>
          <Stack direction="column">
            <RangePicker
              getPopupContainer={(node) => node.parentElement!}
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
              }}
            />
            <Select
              getPopupContainer={(node) => node.parentElement!}
              value={sort}
              defaultValue="desc"
              onChange={(value) => {
                setSort(value);
              }}
            >
              <Option value="desc">Most to least recent</Option>
              <Option value="asc">Least to most recent</Option>
            </Select>
            <Input
              allowClear
              value={search}
              placeholder="Search titles"
              style={{ width: 200 }}
              onChange={({ target }) => {
                const { value } = target;
                setSearch(value);
              }}
            />
            <Select
              getPopupContainer={(node) => node.parentElement!}
              mode="multiple"
              placeholder="Filter by tags"
              allowClear
              style={{ width: 200 }}
              defaultValue={[]}
              value={tags}
              onChange={(value) => {
                setTags(value);
              }}
            >
              {tagCategories.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export { combineFilters };
export default FilterData;
