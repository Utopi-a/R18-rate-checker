import { getIllustCount } from "@/feature/utils/getIllustCount";
import { api } from "@/utils/api";
import {
  AppShell,
  Button,
  Center,
  Container,
  Group,
  JsonInput,
  Loader,
  Paper,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import saveAs from "file-saver";
import Head from "next/head";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

const safeJsonParse = (jsonString: string, defaultValue: string[]): string[] => {
  try {
    return JSON.parse(jsonString) as string[];
  } catch (error) {
    return defaultValue;
  }
};

export default function Home() {
  const [value, setValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [genre, setGenre] = useState("");
  const queryData = useRef<{ queries: string[]; genre: string }>({ queries: [], genre: "" });
  const [isLoading, setIsLoading] = useState(false);

  const [pixivCounts, setPixivCounts] = useState<
    Record<
      string,
      {
        all: number;
        R18: number;
      }
    >[]
  >([]);

  const [shouldFetch, setShouldFetch] = useState(false);

  const pixivApi = api.pixiv.getIllustCount.useQuery({ ...queryData.current }, { enabled: false });

  const handleDownloadExcel = (
    apiData:
      | Record<
          string,
          {
            all: number;
            R18: number;
          }
        >[]
      | undefined
  ) => {
    const dataForExcel = [
      ["キーワード", "全体（件）", "R-18（件）", "R-18率（%）"],
      ...(apiData?.map((data) => [
        Object.keys(data)[0],
        Object.values(data)[0]?.all,
        Object.values(data)[0]?.R18,
        Number((((Object.values(data)[0]?.R18 ?? 0) / (Object.values(data)?.[0]?.all ?? 0)) * 100).toFixed(1)),
      ]) ?? []),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as BinaryData;

    // バイナリデータをBlobに変換し、ファイルとして保存
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "R-18_rate.xlsx");
  };

  const handleClick = async () => {
    setIsLoading(true);
    queryData.current = { queries: safeJsonParse(value, []), genre };
    setPixivCounts(await getIllustCount({ queries: safeJsonParse(value, []), genre }));
    setIsLoading(false);
  };

  const rows = pixivCounts.map((data, index) => (
    <Table.Tr key={index}>
      <Table.Td>{Object.keys(data)[0]}</Table.Td>
      <Table.Td>{Object.values(data)[0]?.all}</Table.Td>
      <Table.Td>{Object.values(data)[0]?.R18}</Table.Td>
      <Table.Td>
        {(((Object.values(data)[0]?.R18 ?? 0) / (Object.values(data)?.[0]?.all ?? 0)) * 100).toFixed(1)}%
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Head>
        <title>R18-rate-checker</title>
        <meta name="description" content="pixivのキャラごとR-18率をExcelに出力！" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <AppShell header={{ height: 80 }} padding="md">
        <AppShell.Header>
          <Stack justify="center" h="100%">
            <Title order={1} ta="center">
              R-18率チェッカー
            </Title>
          </Stack>
        </AppShell.Header>
        <AppShell.Main>
          <Container size={"lg"}>
            <Title order={2}>使い方</Title>
            <Text>入力したジャンル名とキーワードで検索した結果の、R-18率を表示します。</Text>
            <Text>Excel形式でのダウンロードも可能です。</Text>
            <Text>キーワードは「，」、「,」、「、」で区切って入力してください。</Text>
            <Text>JSONを選択すると、JSON形式での入力も可能です。</Text>
            <Text>キーワードごとに約3秒かかります。ゆっくりお待ち下さい。</Text>
            <Stack align="center">
              <Group w={"100%"} justify="center" align="flex-end" mt={40}>
                <Stack w="60%">
                  <Tabs defaultValue="text" color="pink">
                    <Tabs.List mb="md">
                      <Tabs.Tab value="text">TEXT</Tabs.Tab>
                      <Tabs.Tab value="json">JSON</Tabs.Tab>
                    </Tabs.List>
                    <TextInput
                      value={genre}
                      onChange={(event) => setGenre(event.currentTarget.value)}
                      label="ジャンル名"
                      placeholder="ジャンル名で指定をする際に入力してください"
                      mb="sm"
                    />
                    <Tabs.Panel value="text" variant="pills">
                      <Textarea
                        value={textValue}
                        onChange={(event) => {
                          setTextValue(event.currentTarget.value);
                          setValue(JSON.stringify(event.currentTarget.value.split(/[,，、]/)));
                        }}
                        label="キーワード"
                        placeholder="キーワード1,キーワード2,キーワード3, ..."
                        autosize
                        minRows={4}
                      />
                    </Tabs.Panel>
                    <Tabs.Panel value="json">
                      <JsonInput
                        value={value}
                        onChange={setValue}
                        label="キーワード"
                        placeholder='["キーワード1", "キーワード2", "キーワード3", ...]'
                        validationError="JSONの形式が正しくありません。"
                        formatOnBlur
                        autosize
                        minRows={4}
                      />
                    </Tabs.Panel>
                  </Tabs>
                </Stack>
                <Stack gap={8}>
                  <Button
                    color="pink"
                    onClick={() => {
                      setTextValue("島風,雪風,天津風,鹿島,赤城,大井,最上");
                      setValue('["島風","雪風","天津風","鹿島","赤城","大井","最上"]');
                      setGenre("艦これ");
                    }}
                  >
                    デモ
                  </Button>
                  <Button color="pink" onClick={handleClick} w={100}>
                    開始
                  </Button>
                </Stack>
              </Group>
              {(pixivCounts.length > 0 || isLoading) && (
                <Paper p="xl" shadow="xs" withBorder w="100%" radius="md">
                  <Title order={2} mb={"lg"}>
                    キーワードごとのpixivイラストにおけるR-18率
                  </Title>
                  <Group justify="flex-end" mb={"md"}>
                    <Button
                      color="pink"
                      onClick={() => {
                        handleDownloadExcel(pixivCounts);
                      }}
                      disabled={pixivCounts.length === 0}
                    >
                      Excelダウンロード
                    </Button>
                  </Group>
                  <Title order={3} mb={"lg"}>
                    ジャンル：{genre === "" ? "指定なし" : genre}
                  </Title>
                  {!isLoading ? (
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>キーワード</Table.Th>
                          <Table.Th>全体（件）</Table.Th>
                          <Table.Th>R-18（件）</Table.Th>
                          <Table.Th>R-18率（%）</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                  ) : (
                    <Center>
                      <Loader color="pink" />
                    </Center>
                  )}
                </Paper>
              )}
            </Stack>
          </Container>
        </AppShell.Main>
      </AppShell>
    </>
  );
}
