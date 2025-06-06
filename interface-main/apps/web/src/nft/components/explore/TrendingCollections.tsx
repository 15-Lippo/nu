import { OpacityHoverState } from 'components/Common/styles'
import { useTrendingCollections } from 'graphql/data/nft/TrendingCollections'
import styled from 'lib/styled-components'
import CollectionTable from 'nft/components/explore/CollectionTable'
import { useNativeUsdPrice } from 'nft/hooks'
import { CollectionTableColumn, Denomination, TimePeriod, VolumeType } from 'nft/types'
import { useMemo, useState } from 'react'
import { ThemedText } from 'theme/components'
import { HistoryDuration } from 'uniswap/src/data/graphql/uniswap-data-api/__generated__/types-and-hooks'
import { useAppFiatCurrency } from 'uniswap/src/features/fiatCurrency/hooks'

const timeOptions: { label: string; value: TimePeriod }[] = [
  { label: '1D', value: TimePeriod.OneDay },
  { label: '1W', value: TimePeriod.SevenDays },
  { label: '1M', value: TimePeriod.ThirtyDays },
  { label: 'All', value: TimePeriod.AllTime },
]

const ExploreContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ theme }) => `${theme.maxWidth}px`};
  padding: 0 16px;
`

const StyledHeader = styled.h1`
  color: ${({ theme }) => theme.neutral1};
  font-size: 36px;
  line-height: 44px;
  font-weight: 535;
  margin: 0;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    font-size: 20px;
    line-height: 28px;
  }
`

const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 36px;
  margin-bottom: 20px;

  @media only screen and (max-width: ${({ theme }) => `${theme.breakpoint.md}px`}) {
    margin-bottom: 16px;
    margin-top: 16px;
  }
`

const Filter = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.surface3};
  border-radius: 16px;
  padding: 4px;
`

const Selector = styled.div<{ active: boolean }>`
  padding: 8px 12px;
  border-radius: 12px;
  background: ${({ active, theme }) => (active ? theme.surface3 : 'none')};
  cursor: pointer;

  ${OpacityHoverState}
`

const StyledSelectorText = styled(ThemedText.SubHeader)<{ active: boolean }>`
  color: ${({ theme, active }) => (active ? theme.neutral1 : theme.neutral2)};
`

function convertTimePeriodToHistoryDuration(timePeriod: TimePeriod): HistoryDuration {
  switch (timePeriod) {
    case TimePeriod.OneDay:
      return HistoryDuration.Day
    case TimePeriod.SevenDays:
      return HistoryDuration.Week
    case TimePeriod.ThirtyDays:
      return HistoryDuration.Month
    case TimePeriod.AllTime:
      return HistoryDuration.Max
    default:
      return HistoryDuration.Day
  }
}

const TrendingCollections = () => {
  const currentCurrency = useAppFiatCurrency()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.OneDay)
  const [isEthToggled, setEthToggled] = useState(true)

  const { data: trendingCollections, loading: trendingCollectionsAreLoading } = useTrendingCollections(
    100,
    convertTimePeriodToHistoryDuration(timePeriod),
  )

  const ethUsdPrice = useNativeUsdPrice()

  const trendingCollectionColumns = useMemo(() => {
    if (!trendingCollectionsAreLoading && trendingCollections) {
      return trendingCollections.map((d) => ({
        ...d,
        collection: {
          name: d.name,
          logo: d.imageUrl,
          address: d.address,
          isVerified: d.isVerified,
        },
        volume: {
          value: d.volume,
          change: d.volumeChange,
          type: 'eth' as VolumeType,
        },
        floor: {
          value: d.floor,
          change: d.floorChange,
        },
        owners: {
          value: d.owners,
        },
        sales: d.sales,
        totalSupply: d.totalSupply,
        denomination: isEthToggled ? Denomination.ETH : Denomination.USD,
        usdPrice: ethUsdPrice,
      }))
    } else {
      return [] as CollectionTableColumn[]
    }
  }, [trendingCollections, trendingCollectionsAreLoading, isEthToggled, ethUsdPrice])

  return (
    <ExploreContainer>
      <StyledHeader>Trending NFT collections</StyledHeader>
      <FiltersRow>
        <Filter>
          {timeOptions.map((timeOption) => {
            return (
              <Selector
                key={timeOption.value}
                active={timeOption.value === timePeriod}
                onClick={() => setTimePeriod(timeOption.value)}
              >
                <StyledSelectorText lineHeight="20px" active={timeOption.value === timePeriod}>
                  {timeOption.label}
                </StyledSelectorText>
              </Selector>
            )
          })}
        </Filter>
        <Filter onClick={() => setEthToggled(!isEthToggled)}>
          <Selector active={isEthToggled}>
            <StyledSelectorText lineHeight="20px" active={isEthToggled}>
              ETH
            </StyledSelectorText>
          </Selector>
          <Selector active={!isEthToggled}>
            <StyledSelectorText lineHeight="20px" active={!isEthToggled}>
              {currentCurrency}
            </StyledSelectorText>
          </Selector>
        </Filter>
      </FiltersRow>
      <CollectionTable data={trendingCollectionColumns} timePeriod={timePeriod} />
    </ExploreContainer>
  )
}

export default TrendingCollections
