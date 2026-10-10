import React, { useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useTransactions } from '../context/TransactionContext';
import { useCategorias } from '../context/CategoryContext';

export default function DashboardScreen() {
  const params = useLocalSearchParams();

  const {
    transacoes,
    adicionarTransacao,
    removerTransacao,
  } = useTransactions();

  const { categorias } = useCategorias();

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoTransacao, setTipoTransacao] = useState('receita');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState(null);

  let usuario = null;

  try {
    if (params.usuario) {
      usuario =
        typeof params.usuario === 'string'
          ? JSON.parse(params.usuario)
          : params.usuario;
    }
  } catch (error) {
    console.error('Erro ao ler usuário:', error);
  }

  const nomeUsuario =
    usuario?.nome ||
    params.nome ||
    'Anderson Wagner';

  const totalReceitas = transacoes
    .filter((item) => item.tipo === 'receita')
    .reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  const totalDespesas = transacoes
    .filter((item) => item.tipo === 'despesa')
    .reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  const saldoAtual =
    totalReceitas - totalDespesas;

  const formatarMoeda = (valor) => {
    return Number(valor || 0).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      }
    );
  };

  const obterDataAtual = () => {
    const hoje = new Date();

    const dia = String(
      hoje.getDate()
    ).padStart(2, '0');

    const mes = String(
      hoje.getMonth() + 1
    ).padStart(2, '0');

    const ano = hoje.getFullYear();

    return `${dia}/${mes}/${ano}`;
  };

  const abrirModal = (tipo) => {
    setTipoTransacao(tipo);
    setValor('');
    setDescricao('');

    if (tipo === 'despesa') {
      setCategoriaSelecionada(
        categorias?.[0] || null
      );
    } else {
      setCategoriaSelecionada(null);
    }

    setModalVisible(true);
  };

  const fecharModal = () => {
    Keyboard.dismiss();

    setModalVisible(false);
    setValor('');
    setDescricao('');
    setCategoriaSelecionada(null);
  };

  const handleSalvarTransacao = async () => {
    const valorNumerico = Number(
      valor
        .replace(/\./g, '')
        .replace(',', '.')
    );

    if (
      !valor.trim() ||
      isNaN(valorNumerico) ||
      valorNumerico <= 0
    ) {
      Alert.alert(
        'Atenção',
        'Digite um valor válido.'
      );
      return;
    }

    if (!descricao.trim()) {
      Alert.alert(
        'Atenção',
        'Digite uma pequena descrição.'
      );
      return;
    }

    if (
      tipoTransacao === 'despesa' &&
      !categoriaSelecionada
    ) {
      Alert.alert(
        'Atenção',
        'Selecione uma categoria para a despesa.'
      );
      return;
    }

    const novaTransacao = {
      id: Date.now().toString(),
      tipo: tipoTransacao,
      valor: valorNumerico,
      descricao: descricao.trim(),
      data: obterDataAtual(),

      categoria:
        tipoTransacao === 'despesa'
          ? categoriaSelecionada?.nome ||
            'Outros'
          : null,

      icone:
        tipoTransacao === 'receita'
          ? 'arrow-up-outline'
          : 'arrow-down-outline',
    };

    try {
      await adicionarTransacao(
        novaTransacao
      );

      Keyboard.dismiss();
      fecharModal();

      Alert.alert(
        'Sucesso',
        tipoTransacao === 'receita'
          ? 'Receita adicionada com sucesso!'
          : 'Despesa adicionada com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao adicionar transação:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível salvar a transação.'
      );
    }
  };

  const handleExcluirTransacao = (id) => {
    Alert.alert(
      'Excluir transação',
      'Tem certeza que deseja excluir esta transação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',

          onPress: async () => {
            try {
              await removerTransacao(id);
            } catch (error) {
              console.error(
                'Erro ao excluir transação:',
                error
              );

              Alert.alert(
                'Erro',
                'Não foi possível excluir a transação.'
              );
            }
          },
        },
      ]
    );
  };

  const transacoesRecentes = [
    ...transacoes,
  ]
    .reverse()
    .slice(0, 5);

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>
              Olá,
            </Text>

            <Text style={styles.userName}>
              {nomeUsuario}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() =>
              router.push(
                '/ConfiguracaoScreen'
              )
            }
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color="#162D50"
            />
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* VISÃO GERAL */}
          <Text style={styles.sectionTitle}>
            Visão geral
          </Text>

          {/* CARD DO SALDO */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <View>
                <Text
                  style={styles.balanceLabel}
                >
                  SALDO TOTAL
                </Text>

                <Text
                  style={styles.balanceTitle}
                >
                  Seu saldo atual
                </Text>
              </View>

              <View style={styles.balanceIcon}>
                <Ionicons
                  name="wallet-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <Text
              style={styles.mainCardBalance}
            >
              {formatarMoeda(saldoAtual)}
            </Text>

            <View style={styles.divider} />

            <View
              style={styles.balanceSummary}
            >
              <View
                style={styles.summaryItem}
              >
                <Text
                  style={styles.summaryLabel}
                >
                  RECEITAS
                </Text>

                <Text
                  style={
                    styles.summaryValueGreen
                  }
                >
                  {formatarMoeda(
                    totalReceitas
                  )}
                </Text>
              </View>

              <View
                style={styles.summaryItem}
              >
                <Text
                  style={styles.summaryLabel}
                >
                  DESPESAS
                </Text>

                <Text
                  style={
                    styles.summaryValueRed
                  }
                >
                  {formatarMoeda(
                    totalDespesas
                  )}
                </Text>
              </View>
            </View>
          </View>

          {/* ADICIONAR LANÇAMENTO */}
          <Text style={styles.sectionTitle}>
            Adicionar lançamento
          </Text>

          <View style={styles.actionsRow}>
            {/* RECEITA */}
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() =>
                abrirModal('receita')
              }
            >
              <View
                style={
                  styles.actionIconGreen
                }
              >
                <Ionicons
                  name="arrow-up-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={
                  styles.actionTextContainer
                }
              >
                <Text
                  style={styles.actionText}
                >
                  Nova Receita
                </Text>

                <Text
                  style={styles.actionSubtext}
                >
                  Adicionar entrada
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#CBD5E1"
              />
            </TouchableOpacity>

            {/* DESPESA */}
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.85}
              onPress={() =>
                abrirModal('despesa')
              }
            >
              <View
                style={
                  styles.actionIconRed
                }
              >
                <Ionicons
                  name="arrow-down-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={
                  styles.actionTextContainer
                }
              >
                <Text
                  style={styles.actionText}
                >
                  Nova Despesa
                </Text>

                <Text
                  style={styles.actionSubtext}
                >
                  Adicionar saída
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#CBD5E1"
              />
            </TouchableOpacity>
          </View>

          {/* ÚLTIMAS TRANSAÇÕES */}
          <View
            style={styles.transactionsCard}
          >
            <View
              style={styles.transactionsHeader}
            >
              <Text
                style={
                  styles.transactionCardTitle
                }
              >
                Últimas transações
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push(
                    '/GraficoScreen'
                  )
                }
              >
                <Text
                  style={styles.seeMore}
                >
                  Ver gráficos
                </Text>
              </TouchableOpacity>
            </View>

            {transacoesRecentes.length ===
            0 ? (
              <View
                style={styles.emptyContainer}
              >
                <View
                  style={styles.emptyIcon}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={26}
                    color="#CBD5E1"
                  />
                </View>

                <Text
                  style={styles.emptyTitle}
                >
                  Nenhuma transação
                </Text>

                <Text
                  style={styles.emptyText}
                >
                  Suas receitas e despesas
                  aparecerão aqui.
                </Text>
              </View>
            ) : (
              transacoesRecentes.map(
                (item, index) => {
                  const isReceita =
                    item.tipo === 'receita';

                  return (
                    <View
                      key={
                        item.id?.toString() ||
                        index.toString()
                      }
                      style={[
                        styles.transactionRow,

                        index !==
                          transacoesRecentes.length -
                            1 &&
                          styles.transactionBorder,
                      ]}
                    >
                      <View
                        style={[
                          styles.transactionIcon,
                          {
                            backgroundColor:
                              isReceita
                                ? '#D1FAE5'
                                : '#FEE2E2',
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            isReceita
                              ? 'arrow-up-outline'
                              : 'arrow-down-outline'
                          }
                          size={19}
                          color={
                            isReceita
                              ? '#10B981'
                              : '#EF4444'
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.transactionInfo
                        }
                      >
                        <Text
                          style={
                            styles.transactionTitle
                          }
                          numberOfLines={1}
                        >
                          {item.descricao ||
                            (isReceita
                              ? 'Receita'
                              : 'Despesa')}
                        </Text>

                        <Text
                          style={
                            styles.transactionSub
                          }
                          numberOfLines={1}
                        >
                          {isReceita
                            ? 'Receita'
                            : item.categoria ||
                              'Outros'}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.transactionRight
                        }
                      >
                        <Text
                          style={[
                            styles.transactionValue,
                            {
                              color: isReceita
                                ? '#10B981'
                                : '#EF4444',
                            },
                          ]}
                        >
                          {isReceita
                            ? '+ '
                            : '- '}

                          {formatarMoeda(
                            item.valor
                          )}
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            handleExcluirTransacao(
                              item.id
                            )
                          }
                          style={
                            styles.deleteButton
                          }
                        >
                          <Ionicons
                            name="trash-outline"
                            size={17}
                            color="#CBD5E1"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }
              )
            )}
          </View>
        </ScrollView>

        {/* =====================================================
            BARRA INFERIOR
            IDÊNTICA À TELA DE GRÁFICOS
        ===================================================== */}
        <View style={styles.tabBar}>

          {/* INÍCIO - ATIVO */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() =>
              router.replace(
                '/DashboardScreen'
              )
            }
          >
            <View
              style={
                styles.activeIconContainer
              }
            >
              <Ionicons
                name="home"
                size={21}
                color="#162D50"
              />
            </View>

            <Text
              style={styles.tabLabelActive}
            >
              Início
            </Text>

            <View
              style={styles.activeIndicator}
            />
          </TouchableOpacity>

          {/* GRÁFICOS */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() =>
              router.replace(
                '/GraficoScreen'
              )
            }
          >
            <Ionicons
              name="stats-chart"
              size={22}
              color="#94A3B8"
            />

            <Text
              style={
                styles.tabLabelInactive
              }
            >
              Gráficos
            </Text>
          </TouchableOpacity>

          {/* CONFIGURAÇÃO */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() =>
              router.replace(
                '/ConfiguracaoScreen'
              )
            }
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color="#94A3B8"
            />

            <Text
              style={
                styles.tabLabelInactive
              }
            >
              Configuração
            </Text>
          </TouchableOpacity>
        </View>

        {/* =====================================================
            MODAL
        ===================================================== */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={fecharModal}
        >
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={
              Platform.OS === 'ios'
                ? 'padding'
                : 'height'
            }
          >
            <View
              style={styles.modalOverlay}
            >
              <View
                style={styles.modalContainer}
              >
                {/* CABEÇALHO DO MODAL */}
                <View
                  style={styles.modalHeader}
                >
                  <View
                    style={[
                      styles.modalIcon,
                      {
                        backgroundColor:
                          tipoTransacao ===
                          'receita'
                            ? '#D1FAE5'
                            : '#FEE2E2',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        tipoTransacao ===
                        'receita'
                          ? 'arrow-up-outline'
                          : 'arrow-down-outline'
                      }
                      size={23}
                      color={
                        tipoTransacao ===
                        'receita'
                          ? '#10B981'
                          : '#EF4444'
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.modalTitleContainer
                    }
                  >
                    <Text
                      style={
                        styles.modalTitle
                      }
                    >
                      {tipoTransacao ===
                      'receita'
                        ? 'Nova Receita'
                        : 'Nova Despesa'}
                    </Text>

                    <Text
                      style={
                        styles.modalSubtitle
                      }
                    >
                      {tipoTransacao ===
                      'receita'
                        ? 'Registre uma nova entrada'
                        : 'Registre uma nova saída'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={
                      styles.closeButton
                    }
                    onPress={fecharModal}
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={
                    false
                  }
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={
                    styles.modalScrollContent
                  }
                >
                  {/* VALOR */}
                  <View
                    style={styles.inputGroup}
                  >
                    <Text
                      style={styles.inputLabel}
                    >
                      Valor
                    </Text>

                    <View
                      style={
                        styles.inputContainer
                      }
                    >
                      <Text
                        style={
                          styles.currencySymbol
                        }
                      >
                        R$
                      </Text>

                      <TextInput
                        style={
                          styles.modalInput
                        }
                        placeholder="0,00"
                        placeholderTextColor="#94A3B8"
                        value={valor}
                        onChangeText={setValor}
                        keyboardType="decimal-pad"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* DESCRIÇÃO */}
                  <View
                    style={styles.inputGroup}
                  >
                    <Text
                      style={styles.inputLabel}
                    >
                      Descrição
                    </Text>

                    <View
                      style={
                        styles.inputContainer
                      }
                    >
                      <Ionicons
                        name="create-outline"
                        size={19}
                        color="#64748B"
                      />

                      <TextInput
                        style={
                          styles.modalInput
                        }
                        placeholder={
                          tipoTransacao ===
                          'receita'
                            ? 'Ex: Salário'
                            : 'Ex: Mercado'
                        }
                        placeholderTextColor="#94A3B8"
                        value={descricao}
                        onChangeText={
                          setDescricao
                        }
                        autoCapitalize="sentences"
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  {/* CATEGORIAS */}
                  {tipoTransacao ===
                    'despesa' && (
                    <View
                      style={
                        styles.inputGroup
                      }
                    >
                      <Text
                        style={
                          styles.inputLabel
                        }
                      >
                        Categoria
                      </Text>

                      <Text
                        style={
                          styles.categoryHint
                        }
                      >
                        Selecione uma categoria
                        para organizar sua
                        despesa.
                      </Text>

                      <View
                        style={
                          styles.categoriesContainer
                        }
                      >
                        {categorias &&
                        categorias.length > 0 ? (
                          categorias.map(
                            (categoria) => {
                              const selecionada =
                                categoriaSelecionada
                                  ?.id ===
                                categoria.id;

                              return (
                                <TouchableOpacity
                                  key={
                                    categoria.id
                                  }
                                  activeOpacity={
                                    0.8
                                  }
                                  onPress={() =>
                                    setCategoriaSelecionada(
                                      categoria
                                    )
                                  }
                                  style={[
                                    styles.categoryOption,
                                    selecionada &&
                                      styles.categoryOptionSelected,
                                  ]}
                                >
                                  <View
                                    style={[
                                      styles.categoryOptionIcon,
                                      selecionada &&
                                        styles.categoryOptionIconSelected,
                                    ]}
                                  >
                                    <Ionicons
                                      name={
                                        categoria.icone ||
                                        'pricetag-outline'
                                      }
                                      size={18}
                                      color={
                                        selecionada
                                          ? '#FFFFFF'
                                          : '#162D50'
                                      }
                                    />
                                  </View>

                                  <Text
                                    style={[
                                      styles.categoryOptionText,
                                      selecionada &&
                                        styles.categoryOptionTextSelected,
                                    ]}
                                    numberOfLines={
                                      1
                                    }
                                  >
                                    {
                                      categoria.nome
                                    }
                                  </Text>

                                  {selecionada && (
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={19}
                                      color="#10B981"
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            }
                          )
                        ) : (
                          <View
                            style={
                              styles.noCategories
                            }
                          >
                            <Ionicons
                              name="pricetag-outline"
                              size={20}
                              color="#94A3B8"
                            />

                            <Text
                              style={
                                styles.noCategoriesText
                              }
                            >
                              Nenhuma categoria
                              cadastrada.
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* SALVAR */}
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor:
                          tipoTransacao ===
                          'receita'
                            ? '#10B981'
                            : '#162D50',
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={
                      handleSalvarTransacao
                    }
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.saveButtonText
                      }
                    >
                      Salvar{' '}
                      {tipoTransacao ===
                      'receita'
                        ? 'Receita'
                        : 'Despesa'}
                    </Text>
                  </TouchableOpacity>

                  {/* CANCELAR */}
                  <TouchableOpacity
                    style={
                      styles.cancelButton
                    }
                    onPress={fecharModal}
                  >
                    <Text
                      style={
                        styles.cancelButtonText
                      }
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ============================================================
     TELA
  ============================================================ */

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ============================================================
     HEADER
  ============================================================ */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#FFFFFF',
  },

  welcomeText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  userName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#162D50',
    marginTop: 2,
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ============================================================
     SCROLL
  ============================================================ */

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  /* ============================================================
     TÍTULOS
  ============================================================ */

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#162D50',
    marginBottom: 12,
  },

  /* ============================================================
     CARD DO SALDO
  ============================================================ */

  balanceCard: {
    backgroundColor: '#162D50',
    borderRadius: 22,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#162D50',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },

  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  balanceLabel: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  balanceTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 4,
  },

  balanceIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#233D62',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainCardBalance: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#334A6B',
    marginVertical: 17,
  },

  balanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  summaryValueGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 4,
  },

  summaryValueRed: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 4,
  },

  /* ============================================================
     AÇÕES
  ============================================================ */

  actionsRow: {
    gap: 10,
    marginBottom: 25,
  },

  actionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    minHeight: 70,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#162D50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  actionIconGreen: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIconRed: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  actionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#162D50',
  },

  actionSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },

  /* ============================================================
     TRANSAÇÕES
  ============================================================ */

  transactionsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  transactionCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#162D50',
  },

  seeMore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#162D50',
  },

  emptyText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 5,
  },

  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },

  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  transactionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  transactionInfo: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0,
  },

  transactionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#162D50',
  },

  transactionSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },

  transactionRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },

  transactionValue: {
    fontSize: 12,
    fontWeight: '800',
  },

  deleteButton: {
    marginTop: 4,
    padding: 2,
  },

  /* ============================================================
     BARRA INFERIOR
     EXATAMENTE NO PADRÃO DO GRÁFICOS
  ============================================================ */

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
    shadowOffset: {
      width: 0,
      height: -3,
    },
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

  /* ============================================================
     MODAL
  ============================================================ */

  modalKeyboard: {
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    paddingTop: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#162D50',
  },

  modalSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  inputGroup: {
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#162D50',
    marginBottom: 7,
  },

  inputContainer: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
  },

  currencySymbol: {
    fontSize: 14,
    fontWeight: '800',
    color: '#162D50',
    marginRight: 8,
  },

  modalInput: {
    flex: 1,
    fontSize: 14,
    color: '#162D50',
    paddingVertical: 12,
  },

  categoryHint: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 9,
  },

  categoriesContainer: {
    gap: 8,
  },

  categoryOption: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },

  categoryOptionSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },

  categoryOptionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E8EEF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryOptionIconSelected: {
    backgroundColor: '#10B981',
  },

  categoryOptionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#162D50',
    marginLeft: 10,
  },

  categoryOptionTextSelected: {
    color: '#162D50',
    fontWeight: '800',
  },

  noCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },

  noCategoriesText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 7,
  },

  saveButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 5,
  },

  saveButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginLeft: 7,
  },

  cancelButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  cancelButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});