import React, { useEffect, useState } from "react";

import * as S from "./styles";

import Loading from "../../components/Loading";
import { useRouter } from "next/router";

import notification from "../../services/notification";

import ProductListApiGql from "../../components/ProductListApiGql";

function CampaignComponent({
  api,
  validaLogin,
  routeTranslations,
  mktName,
  appImagesUrl,
}) {
  const [contentPage, setContentPage] = useState();
  const [productsloadeds, setProductsLoadeds] = useState([]);
  const [bannerdesk, setBannerDesk] = useState("");
  const [bannermobile, setBannerMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState(1);

  const history = useRouter();

  async function clearSearch() {
    setLoading(true);
    window.scrollTo(0, 0);
    try {
      const { data: response } = await api.get(
        `/cms2/${history.query.name[0]}?page_products=${1}&search=${""}`
      );
      setSearch("");
      setPagination(1);
      setContentPage(response.data[0]);
      setProductsLoadeds(response.data[0].products.data);
    } catch {
      notification("Erro ao carregar página de campanha", "error");
    } finally {
      setLoading(false);
    }
  }

  const getContent = async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get(
        `/cms2/${history.query.name[0]}?page_products=${1}&search=${search}`
      );
      if (response.data.length > 0) {
        setPagination(1);
        setContentPage(response.data[0]);
        setProductsLoadeds(response.data[0].products.data);

        setBannerDesk({
          image: response.data[0].web_path,
          alt: response.data[0].meta_description,
        });
        setBannerMobile({
          image: response.data[0].mobile_path,
          alt: response.data[0].meta_description,
        });
        setLoading(false);
      } else {
        notification("Página de campanha não encontrada", "error");
        setLoading(false);
        history.push("/404");
      }
    } catch {
      notification("Erro ao carregar página de campanha", "error");
    } finally {
      setLoading(false);
    }
  };

  const getContentPagination = async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get(
        `/cms2/${history.query.name[0]}?page_products=${
          pagination + 1
        }&search=${search}`
      );

      if (response.data.length > 0) {
        setPagination(pagination + 1);
        setContentPage(response.data[0].page_title);
        setProductsLoadeds([
          ...productsloadeds,
          ...response.data[0].products.data,
        ]);

        setLoading(false);
      } else {
        notification("Página de campanha não encontrada", "error");
        setLoading(false);
        history.push("/404");
      }
    } catch {
      notification("Erro ao carregar página de campanha", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (history.isReady) {
      getContent();
    }
  }, [history]);

  return (
    <>
      <S.BannerContainer>
        <S.sliderBrowser>
          {bannerdesk && (
            <S.ImageBannerWeb
              alt={bannerdesk.alt}
              title={bannerdesk.alt}
              src={bannerdesk.image}
            />
          )}
        </S.sliderBrowser>
        <S.sliderMobile>
          {bannermobile && (
            <S.ImageBannerMobile
              alt={bannermobile.alt}
              title={bannermobile.alt}
              src={bannermobile.image}
            />
          )}
        </S.sliderMobile>
      </S.BannerContainer>

      <S.ContainerTitle>
        <h2 className="produtos-txt first">{contentPage?.page_title}</h2>
      </S.ContainerTitle>
      <S.SearchContainer>
        <S.SearchBox>
          <S.SearchBar>
            <label htmlFor="search">Buscando por algo específico?</label>
            <S.ContainerSearch>
              <S.ContainerInput>
                <S.ContainerSvg>
                  <S.BuscaIcon onClick={getContent} />
                </S.ContainerSvg>
                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => {
                    e.key === "Enter" && getContent();
                  }}
                />
              </S.ContainerInput>
              <button
                onClick={getContent}
                className="searchButton positiveButton"
              >
                Pesquisar
              </button>
            </S.ContainerSearch>
          </S.SearchBar>
        </S.SearchBox>
      </S.SearchContainer>

      {loading === true ? (
        <Loading />
      ) : (
        <>
          {productsloadeds.length > 0 && (
            <>
              <S.produtos>
                <ProductListApiGql
                  page="campaign"
                  hits={productsloadeds}
                  mktName={mktName}
                  appImagesUrl={appImagesUrl}
                />

                <S.SeeMoreContainer>
                  {contentPage.products !== undefined &&
                    contentPage.products.next_page_url !== undefined &&
                    contentPage.products.next_page_url !== null && (
                      <S.Button
                        onClick={() => {
                          getContentPagination();
                        }}
                      >
                        VER MAIS
                      </S.Button>
                    )}
                  {search !== "" && (
                    <S.ContainerButton>
                      <S.Button onClick={() => clearSearch()}>
                        Limpar Pesquisa
                      </S.Button>
                    </S.ContainerButton>
                  )}
                </S.SeeMoreContainer>
              </S.produtos>
            </>
          )}
        </>
      )}
    </>
  );
}

export default CampaignComponent;
