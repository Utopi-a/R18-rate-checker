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
  TextInput,
  Title,
} from "@mantine/core";
import saveAs from "file-saver";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
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
    // setShouldFetch(true);
  };

  console.log(pixivCounts);

  useEffect(() => {
    if (shouldFetch) {
      void pixivApi.refetch();
      setShouldFetch(false);
    }
  }, [shouldFetch, pixivApi]);

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
        <meta name="description" content="R18率をExcelに出力！" />
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
            <Stack align="center">
              <Group w={"100%"} justify="center" align="flex-end" mt={40}>
                <Stack w="60%">
                  <TextInput
                    value={genre}
                    onChange={(event) => setGenre(event.currentTarget.value)}
                    label="ジャンル名"
                    placeholder="ジャンル名で指定をする際に入力してください"
                  />
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
                </Stack>
                <Button color="pink" onClick={handleClick} w={100}>
                  開始
                </Button>
              </Group>
              {(pixivCounts.length > 0 || isLoading) && (
                <Paper p="xl" shadow="xs" withBorder w="100%">
                  <Title order={2} mb={"lg"}>
                    キーワードごとのpixivイラストにおけるR-18率
                  </Title>
                  <Title order={3} mb={"lg"}>
                    ジャンル：{genre === "" ? "指定なし" : genre}
                  </Title>
                  {!isLoading ? (
                    <>
                      <Group justify="flex-end" mt={-40}>
                        <Button
                          color="pink"
                          onClick={() => {
                            handleDownloadExcel(pixivCounts);
                          }}
                        >
                          Excelダウンロード
                        </Button>
                      </Group>

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
                    </>
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
