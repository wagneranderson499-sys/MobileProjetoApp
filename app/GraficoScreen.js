import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTransactions } from '../context/TransactionContext';

const DEFINICAO_CATEGORIAS = [
  {
    nome: 'Alimentação',
    icone: 'restaurant-outline',
    cor: '#EF4444',
  },
  {
    nome: 'Transporte',
    icone: 'car-outline',
    cor: '#3B82F6',
  },
  {
    nome: 'Contas',
    icone: 'receipt-outline',
    cor: '#F59E0B',
  },
  {
    nome: 'Lazer',
    icone: 'game-controller-outline',
    cor: '#8B5CF6',
  },
  {
    nome: 'Outros',
    icone: 'grid-outline',
    cor: '#64748B',
  },
];

const QUANTIDADE_SEGMENTOS = 144;
const TAMANHO_GRAFICO = 180;
const TAMANHO_SEGMENTO = 10;
const RAIO_GRAFICO = 68;

// =====================================================
// NORMALIZAÇÃO DE TEXTOS
// =====================================================

function normalizarTexto(valor) {
  return String(valor ?? '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// =====================================================
// CONVERSÃO DOS VALORES MONETÁRIOS
// =====================================================

function converterValor(valor) {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? Math.abs(valor) : 0;
  }

  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return 0;
  }

  let texto = String(valor)
    .trim()
    .replace(/R\$/gi, '')
    .replace(/\s/g, '');

  // Exemplos: 1.234,56 ou 1234.56
  if (texto.includes(',')) {
    texto = texto
      .replace(/\./g, '')
      .replace(',', '.');
  }

  const numero = Number(texto);

  return Number.isFinite(numero)
    ? Math.abs(numero)
    : 0;
}

// =====================================================
// IDENTIFICAÇÃO DAS CATEGORIAS
// =====================================================

function resolverCategoria(valorCategoria) {
  const categoria = normalizarTexto(valorCategoria);

  if (!categoria) {
    return 'Outros';
  }

  if (
    categoria.includes('aliment') ||
    categoria.includes('mercado') ||
    categoria.includes('supermerc') ||
    categoria.includes('restaurante') ||
    categoria.includes('comida') ||
    categoria.includes('lanche')
  ) {
    return 'Alimentação';
  }

  if (
    categoria.includes('transport') ||
    categoria.includes('combust') ||
    categoria.includes('gasolina') ||
    categoria.includes('uber') ||
    categoria.includes('onibus') ||
    categoria.includes('passagem')
  ) {
    return 'Transporte';
  }

  if (
    categoria.includes('conta') ||
    categoria.includes('agua') ||
    categoria.includes('luz') ||
    categoria.includes('energia') ||
    categoria.includes('internet') ||
    categoria.includes('aluguel') ||
    categoria.includes('moradia') ||
    categoria.includes('telefone') ||
    categoria.includes('fatura')
  ) {
    return 'Contas';
  }

  if (
    categoria.includes('lazer') ||
    categoria.includes('cinema') ||
    categoria.includes('jogo') ||
    categoria.includes('entreten') ||
    categoria.includes('viagem') ||
    categoria.includes('streaming') ||
    categoria.includes('passeio') ||
    categoria.includes('assinatura')
  ) {
    return 'Lazer';
  }

  const correspondencia = DEFINICAO_CATEGORIAS.find(
    (item) =>
      normalizarTexto(item.nome) === categoria
  );

  return correspondencia
    ? correspondencia.nome
    : 'Outros';
}

// =====================================================
// FORMATAÇÃO DE MOEDA
// =====================================================

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// =====================================================
// GERAÇÃO DOS SEGMENTOS COLORIDOS DO GRÁFICO
// =====================================================

function criarSegmentosDonut(categorias, total) {
  if (
    !total ||
    total <= 0 ||
    categorias.length === 0
  ) {
    return Array.from(
      { length: QUANTIDADE_SEGMENTOS },
      (_, indice) => ({
        indice,
        cor: '#334A6B',
      })
    );
  }

  // Distribui os segmentos proporcionalmente aos gastos.
  const distribuicao = categorias.map(
    (categoria, indice) => {
      const valorExato =
        (categoria.total / total) *
        QUANTIDADE_SEGMENTOS;

      const quantidadeBase = Math.floor(valorExato);

      return {
        indice,
        cor: categoria.cor,
        quantidade: quantidadeBase,
        resto: valorExato - quantidadeBase,
      };
    }
  );

  let quantidadeRestante =
    QUANTIDADE_SEGMENTOS -
    distribuicao.reduce(
      (soma, item) => soma + item.quantidade,
      0
    );

  // Distribui os segmentos restantes pelas maiores frações.
  const porMaiorResto = [...distribuicao].sort(
    (a, b) => b.resto - a.resto
  );

  for (let i = 0; i < quantidadeRestante; i += 1) {
    porMaiorResto[
      i % porMaiorResto.length
    ].quantidade += 1;
  }

  // Tenta representar categorias com valores pequenos.
  distribuicao.forEach((item) => {
    if (item.quantidade === 0) {
      const doador = distribuicao
        .filter((outro) => outro.quantidade > 1)
        .sort(
          (a, b) => b.quantidade - a.quantidade
        )[0];

      if (doador) {
        doador.quantidade -= 1;
        item.quantidade = 1;
      }
    }
  });

  const segmentos = [];

  distribuicao.forEach((item) => {
    for (let i = 0; i < item.quantidade; i += 1) {
      segmentos.push({
        cor: item.cor,
      });
    }
  });

  // Mantém exatamente 144 segmentos.
  while (segmentos.length < QUANTIDADE_SEGMENTOS) {
    segmentos.push({
      cor: categorias[categorias.length - 1].cor,
    });
  }

  return segmentos
    .slice(0, QUANTIDADE_SEGMENTOS)
    .map((item, indice) => ({
      ...item,
      indice,
    }));
}

// =====================================================
// TELA DE GRÁFICOS
// =====================================================

export default function GraficosScreen() {
  const router = useRouter();

  const contexto = useTransactions();

  const transacoes = Array.isArray(contexto?.transacoes)
    ? contexto.transacoes
    : [];

  // ===================================================
  // 1. FILTRA E NORMALIZA AS DESPESAS
  // ===================================================

  const apenasDespesas = useMemo(() => {
    return transacoes
      .map((transacao) => {
        const tipoNormalizado = normalizarTexto(
          transacao?.tipo ??
          transacao?.type ??
          transacao?.tipoTransacao ??
          ''
        );

        const valor = converterValor(
          transacao?.valor ??
          transacao?.amount ??
          transacao?.value
        );

        const categoriaOriginal =
          transacao?.categoria ??
          transacao?.category ??
          transacao?.nomeCategoria ??
          transacao?.categoriaNome ??
          'Outros';

        const ehReceita =
          tipoNormalizado.includes('receita') ||
          tipoNormalizado.includes('income') ||
          tipoNormalizado.includes('entrada');

        const tipoIndicaDespesa =
          tipoNormalizado.includes('despesa') ||
          tipoNormalizado.includes('gasto') ||
          tipoNormalizado.includes('expense') ||
          tipoNormalizado.includes('saida');

        const ehDespesa =
          !ehReceita &&
          (tipoIndicaDespesa || !tipoNormalizado);

        return {
          ...transacao,
          valorCalculado: valor,
          categoriaCalculada:
            resolverCategoria(categoriaOriginal),
          ehDespesa,
        };
      })
      .filter(
        (transacao) =>
          transacao.ehDespesa &&
          transacao.valorCalculado > 0
      );
  }, [transacoes]);

  // ===================================================
  // 2. TOTAL GERAL DOS GASTOS
  // ===================================================

  const totalDespesasGeral = useMemo(() => {
    return apenasDespesas.reduce(
      (total, transacao) =>
        total + transacao.valorCalculado,
      0
    );
  }, [apenasDespesas]);

  // ===================================================
  // 3. CALCULA OS TOTAIS DE CADA CATEGORIA
  // ===================================================

  const categoriasCalculadas = useMemo(() => {
    return DEFINICAO_CATEGORIAS
      .map((categoria) => {
        const itensCategoria = apenasDespesas.filter(
          (transacao) =>
            transacao.categoriaCalculada === categoria.nome
        );

        const totalCategoria = itensCategoria.reduce(
          (total, transacao) =>
            total + transacao.valorCalculado,
          0
        );

        const porcentagem =
          totalDespesasGeral > 0
            ? (totalCategoria / totalDespesasGeral) * 100
            : 0;

        return {
          ...categoria,
          total: totalCategoria,
          porcentagem,
          itens: itensCategoria,
        };
      })
      .filter((categoria) => categoria.total > 0)
      .sort((a, b) => b.total - a.total)
      .map((categoria) => ({
        ...categoria,
        porcentagem:
          totalDespesasGeral > 0
            ? Math.round(
                (categoria.total / totalDespesasGeral) * 100
              )
            : 0,
      }));
  }, [apenasDespesas, totalDespesasGeral]);

  // ===================================================
  // 4. SEGMENTOS DO GRÁFICO CIRCULAR
  // ===================================================

  const segmentosDonut = useMemo(
    () =>
      criarSegmentosDonut(
        categoriasCalculadas,
        totalDespesasGeral
      ),
    [categoriasCalculadas, totalDespesasGeral]
  );

  // ===================================================
  // 5. INTERFACE
  // ===================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="stats-chart"
              size={21}
              color="#162D50"
            />
          </View>

          <View>
            <Text style={styles.headerTitle}>
              Análise Visual
            </Text>

            <Text style={styles.headerSub}>
              Distribuição dos seus gastos
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* GRÁFICO CIRCULAR */}
        <View style={styles.whiteCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>
                GASTOS POR CATEGORIA
              </Text>

              <Text style={styles.totalAmount}>
                {formatarMoeda(totalDespesasGeral)}
              </Text>
            </View>

            <View style={styles.cardHeaderIcon}>
              <Ionicons
                name="pie-chart-outline"
                size={21}
                color="#162D50"
              />
            </View>
          </View>

          {/* ANEL COLORIDO */}
          <View style={styles.donutWrapper}>
            <View style={styles.donutChart}>
              {segmentosDonut.map((segmento) => {
                const angulo =
                  (segmento.indice /
                    QUANTIDADE_SEGMENTOS) *
                    Math.PI *
                    2 -
                  Math.PI / 2;

                const centro = TAMANHO_GRAFICO / 2;

                const x =
                  centro +
                  Math.cos(angulo) * RAIO_GRAFICO -
                  TAMANHO_SEGMENTO / 2;

                const y =
                  centro +
                  Math.sin(angulo) * RAIO_GRAFICO -
                  TAMANHO_SEGMENTO / 2;

                return (
                  <View
                    key={segmento.indice}
                    style={[
                      styles.donutSegment,
                      {
                        backgroundColor: segmento.cor,
                        left: x,
                        top: y,
                      },
                    ]}
                  />
                );
              })}

              {/* CENTRO DO GRÁFICO */}
              <View style={styles.donutInnerCircle}>
                <Text
                  style={styles.donutCenterValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatarMoeda(totalDespesasGeral)}
                </Text>

                <Text style={styles.donutCenterLabel}>
                  Total gasto
                </Text>
              </View>
            </View>
          </View>

          {/* LEGENDA */}
          <View style={styles.legendContainer}>
            {categoriasCalculadas.length === 0 ? (
              <View style={styles.emptyLegend}>
                <Ionicons
                  name="pie-chart-outline"
                  size={20}
                  color="#94A3B8"
                />

                <Text style={styles.emptyText}>
                  Nenhuma despesa categorizada ainda.
                </Text>
              </View>
            ) : (
              categoriasCalculadas.map((item) => (
                <View
                  key={item.nome}
                  style={styles.legendItem}
                >
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: item.cor },
                    ]}
                  />

                  <Text style={styles.legendText}>
                    {item.nome}
                  </Text>

                  <Text style={styles.legendPercent}>
                    {item.porcentagem}%
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* TÍTULO DO DETALHAMENTO */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Detalhamento dos gastos
            </Text>

            <Text style={styles.sectionSub}>
              Categorias do maior para o menor gasto
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <Ionicons
              name="bar-chart-outline"
              size={19}
              color="#162D50"
            />
          </View>
        </View>

        {/* DETALHAMENTO POR CATEGORIA */}
        <View style={styles.infographicContainer}>
          {categoriasCalculadas.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyCardIcon}>
                <Ionicons
                  name="analytics-outline"
                  size={25}
                  color="#94A3B8"
                />
              </View>

              <Text style={styles.emptyCardTitle}>
                Ainda não há dados
              </Text>

              <Text style={styles.emptyCardText}>
                Adicione despesas no Dashboard para visualizar
                seus gráficos.
              </Text>
            </View>
          ) : (
            categoriasCalculadas.map((categoria) => (
              <View
                key={categoria.nome}
                style={styles.infographicCard}
              >
                {/* CABEÇALHO DA CATEGORIA */}
                <View style={styles.infoCardHeader}>
                  <View style={styles.infoCardHeaderLeft}>
                    <View
                      style={[
                        styles.infoIconBg,
                        {
                          backgroundColor: categoria.cor,
                        },
                      ]}
                    >
                      <Ionicons
                        name={categoria.icone}
                        size={18}
                        color="#FFFFFF"
                      />
                    </View>

                    <View style={styles.infoCategoryContent}>
                      <Text style={styles.infoCategoryName}>
                        {categoria.nome}
                      </Text>

                      <Text style={styles.infoCategoryCount}>
                        {categoria.itens.length} lançamento(s)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoCardHeaderRight}>
                    <Text style={styles.infoCategoryTotal}>
                      {formatarMoeda(categoria.total)}
                    </Text>

                    <View
                      style={[
                        styles.infoBadge,
                        {
                          backgroundColor: `${categoria.cor}22`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.infoBadgeText,
                          { color: categoria.cor },
                        ]}
                      >
                        {categoria.porcentagem}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* BARRA COLORIDA */}
                <View style={styles.infoBarBackground}>
                  <View
                    style={[
                      styles.infoBarFill,
                      {
                        width: `${Math.min(
                          categoria.porcentagem,
                          100
                        )}%`,
                        backgroundColor: categoria.cor,
                      },
                    ]}
                  />
                </View>

                {/* LANÇAMENTOS */}
                <View style={styles.infoItemsList}>
                  {categoria.itens.map((item, indice) => (
                    <View
                      key={
                        item.id ??
                        item._id ??
                        `${item.descricao ?? item.titulo ?? categoria.nome}-${indice}`
                      }
                      style={styles.infoItemRow}
                    >
                      <View style={styles.infoItemBullet}>
                        <View
                          style={[
                            styles.bulletDot,
                            {
                              backgroundColor: categoria.cor,
                            },
                          ]}
                        />

                        <Text
                          style={styles.infoItemTitle}
                          numberOfLines={1}
                        >
                          {item.descricao ??
                            item.titulo ??
                            item.nome ??
                            'Despesa'}
                        </Text>
                      </View>

                      <Text style={styles.infoItemValue}>
                        {formatarMoeda(item.valorCalculado)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() =>
            router.replace('/DashboardScreen')
          }
        >
          <Ionicons
            name="home-outline"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.tabLabelInactive}>
            Início
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() =>
            router.replace('/GraficoScreen')
          }
        >
          <View style={styles.activeIconContainer}>
            <Ionicons
              name="stats-chart"
              size={21}
              color="#162D50"
            />
          </View>

          <Text style={styles.tabLabelActive}>
            Gráficos
          </Text>

          <View style={styles.activeIndicator} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() =>
            router.replace('/ConfiguracaoScreen')
          }
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.tabLabelInactive}>
            Configuração
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#162D50',
  },

  headerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  container: {
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  whiteCard: {
    backgroundColor: '#162D50',
    borderRadius: 22,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#233D62',
    shadowColor: '#162D50',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardLabel: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  totalAmount: {
    fontSize: 27,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },

  cardHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },

  donutChart: {
    width: TAMANHO_GRAFICO,
    height: TAMANHO_GRAFICO,
    borderRadius: TAMANHO_GRAFICO / 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  donutSegment: {
    position: 'absolute',
    width: TAMANHO_SEGMENTO,
    height: TAMANHO_SEGMENTO,
    borderRadius: TAMANHO_SEGMENTO / 2,
  },

  donutInnerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 10,
  },

  donutCenterValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#162D50',
    textAlign: 'center',
  },

  donutCenterLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '600',
  },

  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    justifyContent: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#334A6B',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#233D62',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  legendText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
    marginRight: 4,
  },

  legendPercent: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  emptyLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 8,
  },

  emptyText: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    marginLeft: 7,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#162D50',
  },

  sectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  sectionIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infographicContainer: {
    gap: 13,
  },

  infographicCard: {
    backgroundColor: '#162D50',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#233D62',
    shadowColor: '#162D50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },

  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  infoIconBg: {
    width: 39,
    height: 39,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  infoCategoryContent: {
    flex: 1,
    minWidth: 0,
  },

  infoCategoryName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  infoCategoryCount: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 3,
  },

  infoCardHeaderRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  infoCategoryTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  infoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },

  infoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  infoBarBackground: {
    height: 7,
    backgroundColor: '#334A6B',
    borderRadius: 4,
    marginVertical: 13,
    overflow: 'hidden',
  },

  infoBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  infoItemsList: {
    gap: 8,
    paddingTop: 3,
  },

  infoItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 25,
  },

  infoItemBullet: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },

  infoItemTitle: {
    fontSize: 12,
    color: '#CBD5E1',
    flex: 1,
  },

  infoItemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  emptyCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyCardTitle: {
    color: '#162D50',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },

  emptyCardText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },

  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 5,
    paddingTop: 5,
    shadowColor: '#162D50',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },

  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },

  activeIconContainer: {
    width: 38,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabLabelInactive: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 4,
  },

  tabLabelActive: {
    fontSize: 10,
    color: '#162D50',
    fontWeight: '800',
    marginTop: 4,
  },

  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 25,
    height: 3,
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
});